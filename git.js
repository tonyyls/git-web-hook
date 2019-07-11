const util = require("util");
const exec = util.promisify(require("child_process").exec);

let git = {};

/**
 * 克隆仓库
 * @param {string} url 仓库地址
 * @param {string} branch 分支
 * @param {string} localRepo 本地仓库的克隆目录
 */
git.clone = async function(url, branch, localRepo) {
  let command = `git clone ${url} ${ branch != "" ? `-b ${branch}` : ""}`;
  await exec(command, { cwd: localRepo });
};

/**
 * 拉取最新代码
 * @param {string} 仓库在本地的物理路径
 */
git.pull = async function(repoPath) {
  let command = `git pull`;
  await exec(command, { cwd: localRepo });
};

module.exports = git;
