/**
 * Reads the body GitHub renders for a submitted issue form.
 *
 * Each field arrives as `### Label`, a blank line, then the value; an empty
 * optional field arrives as `_No response_`. Returns a map keyed by the
 * lowercased label.
 */
export function parseIssueForm(body) {
  const fields = {};
  const blocks = body.replace(/\r\n/g, '\n').split(/^###[ \t]+/m).slice(1);
  for (const block of blocks) {
    const newline = block.indexOf('\n');
    if (newline === -1) continue;
    const label = block.slice(0, newline).trim().toLowerCase();
    const value = block.slice(newline + 1).trim();
    fields[label] = value === '_No response_' ? '' : value;
  }
  return fields;
}

/** A checkboxes field renders as `- [X] option`; true when any option is ticked. */
export function isTicked(value) {
  return /^- \[x\]/im.test(value ?? '');
}
