// [object Object]
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line header/header
export function populateTemplateString (template: string, data: any): string {
  if (!data) {
    return template;
  }

  return template.replace(/{(.*?)}/g, (match: string, p1: string): string => {
    const keys = p1.split('.');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let value = data;

    for (const key of keys) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      value = value[key];

      if (value === undefined) {
        return '';
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  });
}
