import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configure transporter with environment variables
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>(
      'SMTP_FROM',
      'noreply@whiteboard.com',
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: user && pass ? { user, pass } : undefined,
    });

    this.from = from;
  }

  private from: string;

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Assignment notifications
  async sendAssignmentCreatedEmail(
    to: string,
    studentName: string,
    courseTitle: string,
    assignmentTitle: string,
    dueDate: Date,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Assignment: ${assignmentTitle}</h2>
        <p>Hello ${studentName},</p>
        <p>A new assignment has been posted in <strong>${courseTitle}</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <p>Please log in to the platform to view the assignment details and submit your work.</p>
        <a href="${this.configService.get('APP_URL', 'http://localhost:3000')}/courses" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Assignment
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated email from Whiteboard Learning Platform.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `New Assignment: ${assignmentTitle}`,
      html,
      text: `New assignment posted in ${courseTitle}: ${assignmentTitle}. Due: ${dueDate.toLocaleDateString()}`,
    });
  }

  async sendSubmissionReceivedEmail(
    to: string,
    instructorName: string,
    studentName: string,
    assignmentTitle: string,
    courseTitle: string,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Submission Received</h2>
        <p>Hello ${instructorName},</p>
        <p><strong>${studentName}</strong> has submitted the assignment <strong>${assignmentTitle}</strong> in <strong>${courseTitle}</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Student:</strong> ${studentName}</p>
          <p style="margin: 5px 0;"><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p style="margin: 5px 0;"><strong>Course:</strong> ${courseTitle}</p>
        </div>
        <p>Please review the submission at your earliest convenience.</p>
        <a href="${this.configService.get('APP_URL', 'http://localhost:3000')}/courses/manage" 
           style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Review Submission
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated email from Whiteboard Learning Platform.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `New Submission: ${assignmentTitle} - ${studentName}`,
      html,
      text: `${studentName} submitted ${assignmentTitle} in ${courseTitle}`,
    });
  }

  async sendSubmissionGradedEmail(
    to: string,
    studentName: string,
    assignmentTitle: string,
    grade: number,
    maxPoints: number,
    feedback?: string,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Assignment Graded</h2>
        <p>Hello ${studentName},</p>
        <p>Your submission for <strong>${assignmentTitle}</strong> has been graded.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Grade:</strong> <span style="font-size: 24px; color: #007bff;">${grade}/${maxPoints}</span></p>
          ${feedback ? `<p style="margin: 15px 0 5px 0;"><strong>Feedback:</strong></p><p style="margin: 5px 0; white-space: pre-wrap;">${feedback}</p>` : ''}
        </div>
        <a href="${this.configService.get('APP_URL', 'http://localhost:3000')}/courses" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Details
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated email from Whiteboard Learning Platform.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Assignment Graded: ${assignmentTitle}`,
      html,
      text: `Your assignment ${assignmentTitle} has been graded: ${grade}/${maxPoints}${feedback ? `\nFeedback: ${feedback}` : ''}`,
    });
  }

  // Course and Module completion notifications
  async sendModuleCompletedEmail(
    to: string,
    studentName: string,
    moduleTitle: string,
    courseTitle: string,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">🎉 Module Completed!</h2>
        <p>Hello ${studentName},</p>
        <p>Congratulations! You have successfully completed the module <strong>${moduleTitle}</strong> in <strong>${courseTitle}</strong>.</p>
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0;">
          <p style="margin: 5px 0;">Keep up the great work! Continue learning to complete the course.</p>
        </div>
        <a href="${this.configService.get('APP_URL', 'http://localhost:3000')}/courses" 
           style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Continue Learning
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated email from Whiteboard Learning Platform.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Module Completed: ${moduleTitle}`,
      html,
      text: `Congratulations! You completed ${moduleTitle} in ${courseTitle}`,
    });
  }

  async sendCourseCompletedEmail(
    to: string,
    studentName: string,
    courseTitle: string,
    completionRate: number,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">🎓 Course Completed!</h2>
        <p>Hello ${studentName},</p>
        <p>Congratulations! You have successfully completed <strong>${courseTitle}</strong>!</p>
        <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0; text-align: center;">
          <p style="margin: 5px 0; font-size: 18px;">✨ Achievement Unlocked ✨</p>
          <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #28a745;">${completionRate}%</p>
          <p style="margin: 5px 0;">Course Completion Rate</p>
        </div>
        <p>You've demonstrated commitment and dedication throughout this course. Well done!</p>
        <a href="${this.configService.get('APP_URL', 'http://localhost:3000')}/courses" 
           style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Explore More Courses
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated email from Whiteboard Learning Platform.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `🎓 Course Completed: ${courseTitle}`,
      html,
      text: `Congratulations! You completed ${courseTitle} with ${completionRate}% completion rate!`,
    });
  }

  // General announcement notification
  async sendAnnouncementEmail(
    to: string,
    studentName: string,
    courseTitle: string,
    announcementTitle: string,
    announcementContent: string,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">📢 New Announcement</h2>
        <p>Hello ${studentName},</p>
        <p>A new announcement has been posted in <strong>${courseTitle}</strong>.</p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">${announcementTitle}</h3>
          <p style="color: #856404; white-space: pre-wrap;">${announcementContent}</p>
        </div>
        <a href="${this.configService.get('APP_URL', 'http://localhost:3000')}/courses" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Course
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated email from Whiteboard Learning Platform.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `New Announcement in ${courseTitle}`,
      html,
      text: `New announcement in ${courseTitle}: ${announcementTitle}\n\n${announcementContent}`,
    });
  }

  async sendQuizCompletedEmail(
    to: string,
    studentName: string,
    quizTitle: string,
    courseTitle: string,
    score: number,
    maxScore: number,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Quiz Completed</h2>
        <p>Hello ${studentName},</p>
        <p>You have completed <strong>${quizTitle}</strong> in <strong>${courseTitle}</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <p style="margin: 5px 0;"><strong>Your Score:</strong></p>
          <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #007bff;">${score}/${maxScore}</p>
          <p style="margin: 5px 0;">Percentage: ${Math.round((score / maxScore) * 100)}%</p>
        </div>
        <a href="${this.configService.get('APP_URL', 'http://localhost:3000')}/courses" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Details
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated email from Whiteboard Learning Platform.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Quiz Completed: ${quizTitle}`,
      html,
      text: `You completed ${quizTitle} in ${courseTitle}. Score: ${score}/${maxScore}`,
    });
  }
}
