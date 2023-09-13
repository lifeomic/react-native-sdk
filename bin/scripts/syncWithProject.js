const { TscWatchClient } = require('tsc-watch/client');
const { execSync } = require('child_process');
const project = process.argv[2];

const watch = new TscWatchClient();

if (typeof project !== 'string') {
  throw new Error('Expect string for argument project');
}

const syncChanges = () => {
  console.log('Copying changes to', project);
  execSync('yarn copyAdditionalFiles && yarn buildDeclaredStyles', {
    stdio: 'inherit',
  });
  execSync(
    `cp -r ./dist/ ../${project}/node_modules/@lifeomic/react-native-sdk`,
    {
      stdio: 'inherit',
    },
  );
  console.log('Copy complete');
};
watch.start('--project', 'tsconfig.build.json', '--outDir', 'dist');
watch.on('success', syncChanges);
