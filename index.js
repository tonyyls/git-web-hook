"use strict";
const fs = require("fs-extra");
const path = require("path");
const http = require("http");
const qs = require("query-string");
const git = require("./git.js");
const config = require("./config.json");
const port = config.port;
const localRepo = path.join(config.localRepo);

// 确保拉取代码的目录存在
if (!fs.existsSync(localRepo)) {
  fs.mkdirSync(localRepo);
}

// 处理git push hook请求
function handleRequest(req, res) {
  // 考虑url后面带参数来支持更多特性
  const url = req.url;
  const queryStr = url.substring(url.indexOf('?')+1);
  const queryOptions = qs.parse(queryStr);
  const contextPath = url.substring(0,url.indexOf('?'));

  if (req.method == "POST") {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
    });
    req.on("end", async () => {
      data = decodeURI(data);
      data = JSON.parse(data);
      let repo = findRepository(data.repository);
      if (repo) {
        await fetchRepo(repo);
        await copyRepo(repo, queryOptions, contextPath);
        await execCmd(repo);
      }
      console.log(repo);
    });
  }
  res.write("ok");
  res.end();
}

// 获取仓库在本地的地址
function getRepoLocalPath(repo) {
  const url = repo.url;
  const repoName = url.substring(
    url.lastIndexOf("/") + 1,
    url.lastIndexOf(".")
  );
  const repoPath = path.join(localRepo, repoName);
  return repoPath;
}

// pull 或者 clone 仓库资源
async function fetchRepo(repo) {
  const url = repo.url;
  const repoPath = getRepoLocalPath(repo);
  const branch = repo.branch || "";
  if (fs.existsSync(repoPath)) {
    return await git.pull(repoPath).catch(error => {
      console.error(error);
    });
  } else {
    return await git.clone(url, branch, localRepo).then(()=>{
      console.log('clone finish');
    }).catch(error => {
      console.error(error);
    });
  }
}

// 从配置中找到对应的仓库
function findRepository(repo) {
  const sshUrl = repo["ssh_url"];
  const cloneUrl = repo["clone_url"];
  let result;
  config.repository.map(item => {
    if (item.url == sshUrl || item.url == cloneUrl) {
      result = item;
      return;
    }
  });
  return result;
}

// 拷贝仓库到指定的工作路径
async function copyRepo(repo, options, contextPath) {
  const dir = options.dir || "";
  let repoPath = getRepoLocalPath(repo);
  // 拷贝指定dir
  repoPath = path.join(repoPath, dir);
  let deployPath = repo.deployPath;
  if (deployPath) {
    // 拼接上下文作为目录
    deployPath = path.join(deployPath,contextPath);
    if(!fs.existsSync(deployPath)){
      fs.mkdirsSync(deployPath);
    }
    return fs.emptyDir(deployPath).then(fs.copy(repoPath, deployPath));
  }
}

// 拷贝完成后将会在对应的目录下执行的脚本
async function execCmd(repo) {
  // todo 
}

const server = http.createServer(handleRequest);
server.listen(config.port, () => {
  console.log(`WebHook Server running on port ${port}`);
});
