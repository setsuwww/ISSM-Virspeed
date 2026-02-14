import chalk from "chalk"
import ora from "ora";

console.log("\n" + chalk.bgBlue.white.bold(`Preparing seed data for Javascript`))

const cleanSpinner = ora("Processing...").start();
cleanSpinner.succeed("Seeder successfully insert");
