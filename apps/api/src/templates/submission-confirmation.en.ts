import {
  MailTemplateResult,
  renderSubmissionConfirmationShell,
} from './submission-confirmation.shared';

export function buildSubmissionConfirmationEnTemplate(
  name: string,
  course: string,
): MailTemplateResult {
  const studentName = name.trim() || 'Student';
  const selectedCourse = course.trim() || 'English Language Program';
  const subject = 'We received your English intake form';
  const text = [
    `Thank you, ${studentName}.`,
    '',
    `We received your English Language Intake form for ${selectedCourse}.`,
    'Our team will review your submission and contact you soon if we need any additional details or when next steps are ready.',
    '',
    'We appreciate your interest in studying English at CSN.',
  ].join('\n');

  const html = renderSubmissionConfirmationShell({
    lang: 'en',
    preheader: `We received your intake form for ${selectedCourse}.`,
    eyebrow: 'College of Southern Nevada',
    sectionLabel: 'English Language Intake',
    title: `Thank you, ${studentName}`,
    intro:
      'We received your English Language Intake form and our team will review it shortly.',
    detailLabel: 'Program selected',
    detailValue: selectedCourse,
    note: 'You do not need to do anything else right now. We will reach out if we need more information or when your next steps are ready.',
    closing: 'We appreciate your interest in studying English at CSN.',
    footer:
      'This confirmation was sent automatically after your intake form was submitted.',
  });

  return { subject, text, html };
}
