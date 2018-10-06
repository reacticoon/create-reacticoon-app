//
// Realise a Reacticoon checkup.
//

// TODO: dynamically add check methods on user node_modules
const checks = [require("./checks/checkCreateReacticoonApp"), require("./checks/checkReactVersion"), require("./checks/checkReacticoon")];

function main() {
  checks.forEach(check => {
    console.log(`${check.name}: ${check.description}`);
    check.run();
    console.log('\n')
  });
}

main();
