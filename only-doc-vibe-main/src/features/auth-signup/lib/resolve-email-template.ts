export const resolveEmailTemplate = (template: string, email: string): string =>
  template.replaceAll("{useremail}", email).replaceAll("{{useremail}}", email);
