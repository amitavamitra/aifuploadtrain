const YAML = require('yaml');
const fs = require('fs');

const writeYamlFile = require('write-yaml-file')

const jobj = require('./argoCrud.json');

const jsonObject = {
    version: "1.0.0",
    dependencies: {
        yaml: "^1.10.0"
    },
    package: {
        exclude: [ ".idea/**", ".gitignore" ]
    }
}

const doc = new YAML.Document();
doc.contents = jobj;

console.log(doc.toString());

writeYamlFile('argo.yaml', doc.contents).then(() => {
  console.log('done')
})

// https://codepen.io/jlengstorf/pen/rNMpJNy


