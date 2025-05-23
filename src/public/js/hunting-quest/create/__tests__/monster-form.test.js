/**
 * @jest-environment jsdom
 */
import path from 'path';
import ejs from 'ejs';
import { JSDOM } from 'jsdom';
import { getByRole } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

const targetFile = path.resolve(
  process.cwd(),
  'src/views/components/hunting-quest/monster-form.ejs'
);

const mockMonsters = [{ id: 1, Name: 'Rathian' }];

describe('monster forms section', () => {
  let container;
  const user = userEvent.setup();
  beforeEach(async () => {
    const htmlString = await ejs.renderFile(targetFile, {
      monsters: mockMonsters,
    });
    const dom = new JSDOM(htmlString);
    container = dom.window.document.body;
  });
  test('should load add monster button', () => {
    expect(
      getByRole(container, 'button', { name: /add monster/i })
    ).toBeInTheDocument();
  });
  test('should show monster form on add monster button click', async () => {
    const addMonsterButton = getByRole(container, 'button', {
      name: /add monster/i,
    });
    await user.click(addMonsterButton);
  });
});
