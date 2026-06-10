import {
  MailTemplateResult,
  renderSubmissionConfirmationShell,
} from './submission-confirmation.shared';

export function buildSubmissionConfirmationEsTemplate(
  name: string,
  course: string,
): MailTemplateResult {
  const studentName = name.trim() || 'Estudiante';
  const selectedCourse = course.trim() || 'Programa de ingles';
  const subject = 'Recibimos su formulario de admision de ingles';
  const text = [
    `Gracias, ${studentName}.`,
    '',
    `Recibimos su formulario de admision de ingles para ${selectedCourse}.`,
    'Nuestro equipo revisara su envio y se comunicara pronto con usted si necesitamos mas informacion o cuando los siguientes pasos esten listos.',
    '',
    'Agradecemos su interes en estudiar ingles en CSN.',
  ].join('\n');

  const html = renderSubmissionConfirmationShell({
    lang: 'es',
    preheader: `Recibimos su formulario para ${selectedCourse}.`,
    eyebrow: 'College of Southern Nevada',
    sectionLabel: 'Formulario de admision de ingles',
    title: `Gracias, ${studentName}`,
    intro:
      'Recibimos su formulario de admision de ingles y nuestro equipo lo revisara pronto.',
    detailLabel: 'Programa seleccionado',
    detailValue: selectedCourse,
    note: 'Por ahora no necesita hacer nada mas. Le escribiremos si necesitamos mas informacion o cuando sus siguientes pasos esten listos.',
    closing: 'Agradecemos su interes en estudiar ingles en CSN.',
    footer:
      'Esta confirmacion se envio automaticamente despues de recibir su formulario.',
  });

  return { subject, text, html };
}
