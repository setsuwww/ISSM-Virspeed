import chalk from "chalk"

export const log = {
  step: (msg) =>
    console.log(chalk.blue.bold("➜"), chalk.white(msg)),

  success: (msg) =>
    console.log(chalk.green.bold("✔ SUCCESS"), chalk.green(msg)),

  error: (msg) =>
    console.log(chalk.red.bold("✖ ERROR"), chalk.red(msg)),

  section: (msg) =>
    console.log("\n" + chalk.bgMagenta.white.bold(` ${msg} `)),
};
