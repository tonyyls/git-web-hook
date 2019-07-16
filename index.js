'use strict';
const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const qs = require('query-string');
const logger = require('./log.js');
const git = require('./git.js');
const config = require('./config.json');

const port = config.port;
const localRepo = path.join(config.localRepo);

// 确保拉取代码的目录存在
function ensureLocalRepo() {
  if (!fs.existsSync(localRepo)) {
    fs.mkdirSync(localRepo);
  }
}

// 处理git push hook请求
function handleRequest(req, res) {
  ensureLocalRepo();
  // 考虑url后面带参数来支持更多特性
  const url = req.url;
  let queryOptions, contextPath;
  let index = url.indexOf('?');
  if (index > 0) {
    queryOptions = qs.parse(url.substring(index + 1));
    contextPath = url.substring(0, index);
  } else {
    queryOptions = {};
    contextPath = url;
  }

  if (req.method == 'POST') {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', async () => {
      // 当请求结束时候，立刻回复服务器
      res.write('ok');
      res.end();

      data = decodeURI(data);
      data = JSON.parse(data);
      logger.info(data);
      let repo = findRepository(data.repository);
      logger.info(repo);
      if (repo) {
        await fetchRepo(repo, queryOptions);
        await copyRepo(repo, queryOptions, contextPath);
        await execScript(repo);
        logger.info('Successfull.');
      }
    });
  }
}

// 获取仓库在本地的地址
function getRepoLocalPath(repo) {
  const url = repo.url;
  const repoName = url.substring(
    url.lastIndexOf('/') + 1,
    url.lastIndexOf('.')
  );
  const repoPath = path.join(localRepo, repoName);
  return repoPath;
}

// pull 或者 clone 仓库资源
async function fetchRepo(repo, options) {
  const url = repo.url;
  const repoPath = getRepoLocalPath(repo);
  const branch = options.branch || repo.branch || '';
  if (fs.existsSync(repoPath)) {
    return await git
      .pull(repoPath)
      .then(() => {
        logger.info('git pull finish');
      })
      .catch(error => {
        logger.error(error);
      });
  } else {
    return await git
      .clone(url, branch, localRepo)
      .then(() => {
        logger.info('git clone finish');
      })
      .catch(error => {
        logger.error(error);
      });
  }
}

// 从配置中找到对应的仓库
function findRepository(repo) {
  let urls = [];
  urls.push(repo['ssh_url']);
  urls.push(repo['clone_url']);
  urls.push(repo['git_ssh_url']);
  urls.push(repo['git_http_url']);
  let result;
  config.repository.map(item => {
    if (urls.includes(item.url)) {
      result = item;
      return;
    }
  });
  return result;
}

// 拷贝仓库到指定的工作路径
async function copyRepo(repo, options, contextPath) {
  const dir = options.dir || '';
  let repoPath = getRepoLocalPath(repo);
  // 拷贝指定dir
  repoPath = path.join(repoPath, dir);
  let deployPath = repo.deployPath;
  if (deployPath) {
    // 拼接上下文作为目录
    deployPath = path.join(deployPath, contextPath);
    if (!fs.existsSync(deployPath)) {
      fs.mkdirsSync(deployPath);
    }
    logger.info(`copy ${repoPath} to ${deployPath}`);
    return fs.emptyDir(deployPath).then(fs.copy(repoPath, deployPath));
  }
}

// 拷贝完成后将会在对应的目录下执行的脚本
async function execScript(repo) {
  // todo
}

const server = http.createServer(handleRequest);
server.listen(config.port, () => {
  logger.info(`WebHook Server running on port ${port}`);
});