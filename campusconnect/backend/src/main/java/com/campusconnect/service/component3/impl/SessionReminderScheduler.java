package com.campusconnect.service.component3.impl;

import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component3.GroupMember;
import com.campusconnect.entity.component3.Session;
import com.campusconnect.repository.component3.GroupMemberRepository;
import com.campusconnect.repository.component3.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SessionReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(SessionReminderScheduler.class);
    private static final String TARGET_STATUS = "SCHEDULED";
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final SessionRepository sessionRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.notifications.session-reminder.enabled:true}")
    private boolean remindersEnabled;

    @Value("${app.notifications.session-reminder.lead-minutes:60}")
    private long leadMinutes;

    @Value("${app.notifications.session-reminder.from-address:}")
    private String fromAddress;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Scheduled(fixedDelayString = "${app.notifications.session-reminder.poll-ms:60000}")
    @Transactional
    public void sendSessionReminders() {
        if (!remindersEnabled) {
            return;
        }

        if (!StringUtils.hasText(mailHost)) {
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderThreshold = now.plusMinutes(Math.max(0, leadMinutes));

        List<Session> sessions = sessionRepository.findByStatusIgnoreCaseAndReminderSentAtIsNull(TARGET_STATUS);

        for (Session session : sessions) {
            if (session.getSessionDate() == null || session.getStartTime() == null) {
                continue;
            }

            LocalDateTime sessionStart = LocalDateTime.of(session.getSessionDate(), session.getStartTime());
            if (sessionStart.isBefore(now) || sessionStart.isAfter(reminderThreshold)) {
                continue;
            }

            Set<String> recipients = resolveRecipients(session);
            if (recipients.isEmpty()) {
                session.setReminderSentAt(LocalDateTime.now());
                continue;
            }

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                if (StringUtils.hasText(fromAddress)) {
                    message.setFrom(fromAddress);
                }
                message.setTo(recipients.toArray(new String[0]));
                message.setSubject("Session Reminder: " + session.getSessionName());
                message.setText(buildMessageBody(session, sessionStart));

                mailSender.send(message);
                session.setReminderSentAt(LocalDateTime.now());
            } catch (MailException ex) {
                log.error("Failed to send reminder for sessionId={}", session.getSessionId(), ex);
            }
        }
    }

    private Set<String> resolveRecipients(Session session) {
        Set<String> recipients = new LinkedHashSet<>();

        User organizer = session.getCreatedBy();
        if (organizer != null && StringUtils.hasText(organizer.getEmail())) {
            recipients.add(organizer.getEmail().trim());
        }

        Long groupId = session.getStudyGroup() == null ? null : session.getStudyGroup().getGroupId();
        if (groupId == null) {
            return recipients;
        }

        List<GroupMember> groupMembers = groupMemberRepository.findByStudyGroup_GroupId(groupId);
        for (GroupMember member : groupMembers) {
            User user = member.getUser();
            if (user != null && StringUtils.hasText(user.getEmail())) {
                recipients.add(user.getEmail().trim());
            }
        }

        return recipients;
    }

    private String buildMessageBody(Session session, LocalDateTime sessionStart) {
        String mode = session.getMode() == null ? "UNKNOWN" : session.getMode();
        String locationOrLink = "ONLINE".equalsIgnoreCase(mode)
                ? (StringUtils.hasText(session.getLink()) ? session.getLink() : "No meeting link provided")
                : (StringUtils.hasText(session.getLocation()) ? session.getLocation() : "No location provided");

        return "Hello,\n\n"
                + "This is an automatic reminder for your upcoming study session.\n\n"
                + "Session: " + session.getSessionName() + "\n"
                + "Date & Time: " + sessionStart.format(DATE_TIME_FORMATTER) + "\n"
                + "Mode: " + mode + "\n"
                + ("ONLINE".equalsIgnoreCase(mode) ? "Meeting Link: " : "Location: ") + locationOrLink + "\n\n"
                + "Regards,\n"
                + "CampusConnect";
    }
}
