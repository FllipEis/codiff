import { expect, test } from 'vite-plus/test';
import { fileHasVisibleDiff, getDiffSearchResult, getVisibleDiffSections } from './App.tsx';
import type { ChangedFile } from './types.ts';

test('pure renames are visible without content hunks', () => {
  const file = {
    fingerprint: 'rename-only',
    oldPath: 'old.txt',
    path: 'new.txt',
    sections: [
      {
        binary: false,
        id: 'new.txt:staged',
        kind: 'staged',
        newFile: {
          contents: 'same contents\n',
          name: 'new.txt',
        },
        oldFile: {
          contents: 'same contents\n',
          name: 'old.txt',
        },
        patch:
          'diff --git a/old.txt b/new.txt\nsimilarity index 100%\nrename from old.txt\nrename to new.txt\n',
      },
    ],
    status: 'renamed',
  } satisfies ChangedFile;

  const visibleSections = getVisibleDiffSections(file, false);

  expect(visibleSections).toHaveLength(1);
  expect(visibleSections[0].fileDiff.hunks).toHaveLength(0);
  expect(fileHasVisibleDiff(file, false)).toBe(true);
});

test('diff search finds content matches across sides', () => {
  const file = {
    fingerprint: 'content-search',
    path: 'src/search.ts',
    sections: [
      {
        binary: false,
        id: 'src/search.ts:unstaged',
        kind: 'unstaged',
        newFile: {
          contents: 'const label = "beta";\nconst value = "needle";\n',
          name: 'src/search.ts',
        },
        oldFile: {
          contents: 'const label = "alpha";\nconst value = "hay";\n',
          name: 'src/search.ts',
        },
        patch: '',
      },
    ],
    status: 'modified',
  } satisfies ChangedFile;

  const result = getDiffSearchResult(file, false, 'needle');

  expect(result?.matches).toEqual([
    {
      filePath: 'src/search.ts',
      itemId: 'diff:src/search.ts:unstaged',
      lineNumber: 2,
      side: 'additions',
    },
  ]);
  expect(result?.matchCount).toBe(1);
});

test('diff search includes file path matches', () => {
  const file = {
    fingerprint: 'path-search',
    path: 'src/needle.ts',
    sections: [
      {
        binary: false,
        id: 'src/needle.ts:unstaged',
        kind: 'unstaged',
        newFile: {
          contents: 'same\n',
          name: 'src/needle.ts',
        },
        oldFile: {
          contents: 'different\n',
          name: 'src/needle.ts',
        },
        patch: '',
      },
    ],
    status: 'modified',
  } satisfies ChangedFile;

  expect(getDiffSearchResult(file, false, 'needle')?.matches[0]).toEqual({
    filePath: 'src/needle.ts',
    itemId: 'diff:src/needle.ts:unstaged',
  });
});
