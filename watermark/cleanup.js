const fs = require('node:fs');
const path = require('node:path');

const jobsDir = process.env.JOBS_DIR || '/app/jobs';
const inputDir = process.env.INPUT_DIR || '/app/input';
const outputDir = process.env.OUTPUT_DIR || '/app/output';
const removeAll = process.argv.includes('--all');

async function removeFilesInDir(dir, predicate) {
  let removed = 0;
  let kept = 0;

  let files = [];
  try {
    files = await fs.promises.readdir(dir);
  } catch (error) {
    console.error(`[cleanup] cannot read ${dir}:`, error.message);
    return { removed, kept };
  }

  for (const file of files) {
    if (!predicate(file)) {
      kept += 1;
      continue;
    }

    try {
      await fs.promises.unlink(path.join(dir, file));
      removed += 1;
    } catch (error) {
      console.error(`[cleanup] cannot remove ${path.join(dir, file)}:`, error.message);
    }
  }

  return { removed, kept };
}

async function main() {
  const jobPredicate = (file) => removeAll || file.endsWith('.json') || file.endsWith('.json.done') || file.endsWith('.json.error');
  const ioPredicate = () => removeAll;

  const [jobs, input, output] = await Promise.all([
    removeFilesInDir(jobsDir, jobPredicate),
    removeFilesInDir(inputDir, ioPredicate),
    removeFilesInDir(outputDir, ioPredicate),
  ]);

  console.log(JSON.stringify({
    mode: removeAll ? 'all' : 'stale-artifacts',
    jobsDir: { ...jobs, path: jobsDir },
    inputDir: { ...input, path: inputDir },
    outputDir: { ...output, path: outputDir },
  }, null, 2));
}

main().catch((error) => {
  console.error('[cleanup] failed:', error);
  process.exit(1);
});
