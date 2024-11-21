const fs = require('fs');
const path = require('path');

const basePackage = require('./package.json');
const overridePath = './override.json';

function parsePackagesArg() {
  const packagesArg = process.env.BUILD_PACKAGES || '';
  if (!packagesArg) return {};

  console.log('Parsing packages:', packagesArg);

  const dependencies = {};
  packagesArg.split(/\s+/).filter(Boolean).forEach(pkg => {
    const match = pkg.match(/^(@[^@]+\/[^@]+)(?:@(.+))?$/) || pkg.match(/^([^@]+)(?:@(.+))?$/);
    
    if (match) {
      const [, name, version] = match;
      dependencies[name] = version || 'latest';
      console.log(`Added dependency: ${name}@${version || 'latest'}`);
    } else {
      console.warn(`Failed to parse package: ${pkg}`);
    }
  });

  return { dependencies };
}

function deepMerge(target, ...sources) {
  const result = { ...target };
  
  sources.forEach(source => {
    if (!source) return;
    
    for (const key in source) {
      if (source[key] instanceof Object && key in result) {
        result[key] = deepMerge(result[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  });
  
  return result;
}

function logChanges(original, merged) {
  const changes = [];
  
  function compare(orig, mrgd, path = []) {
    for (const key in mrgd) {
      const currentPath = [...path, key];
      
      if (mrgd[key] instanceof Object && orig?.[key] instanceof Object) {
        compare(orig[key], mrgd[key], currentPath);
      } else if (orig?.[key] !== mrgd[key]) {
        changes.push({
          path: currentPath,
          original: orig?.[key],
          new: mrgd[key]
        });
      }
    }
  }
  
  compare(original, merged);
  return changes;
}

function mergePackages() {
  console.log('\n=== Starting package merge ===');
  console.log('BUILD_PACKAGES env:', process.env.BUILD_PACKAGES);
  
  const packagesOverride = parsePackagesArg();
  console.log('\nParsed packages override:', JSON.stringify(packagesOverride, null, 2));
  
  let fileOverride = {};
  if (fs.existsSync(overridePath)) {
    fileOverride = require(overridePath);
    console.log('\nFile override content:', JSON.stringify(fileOverride, null, 2));
  }

  const basePackageContent = JSON.stringify(basePackage, null, 2);
  console.log('\nBase package.json:', basePackageContent);

  const mergedPackage = deepMerge(basePackage, fileOverride, packagesOverride);
  console.log('\nMerged package.json:', JSON.stringify(mergedPackage, null, 2));

  const changes = logChanges(basePackage, mergedPackage);
  if (changes.length > 0) {
    console.log('\n=== Changes detected ===');
    changes.forEach(({ path, original, new: newValue }) => {
      console.log(`\nPath: ${path.join('.')}`);
      console.log(`Original: ${JSON.stringify(original)}`);
      console.log(`New: ${JSON.stringify(newValue)}`);
    });

    fs.writeFileSync(
      path.join(__dirname, 'package.json'),
      JSON.stringify(mergedPackage, null, 2)
    );
    
    fs.writeFileSync('install.flag', '');
    console.log('\ninstall.flag created');
  } else {
    console.log('\nNo changes detected');
  }
}

function findConflicts(fileDeps = {}, argDeps = {}) {
  const conflicts = [];
  
  for (const pkg in argDeps) {
    if (pkg in fileDeps && fileDeps[pkg] !== argDeps[pkg]) {
      conflicts.push({
        package: pkg,
        fileVersion: fileDeps[pkg],
        argVersion: argDeps[pkg]
      });
    }
  }
  
  return conflicts;
}

mergePackages();