"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

const fs = require("fs");
const path = require("path");
var apps_keys;
const appsPath = path.resolve("./.apps.json"),
  configPath = path.resolve("./.config.json");

let appsStr = fs.readFileSync(appsPath, {
  flag: "r",
  ecoding: "utf8"
});
let configStr = fs.readFileSync(configPath, {
  flag: "r",
  ecoding: "utf8"
});

let apps = JSON.parse(appsStr.toString());
let config = JSON.parse(configStr.toString());

let actu_env = "";
switch (process.env.NODE_ENV) {
  case "production":
    actu_env = "env_production";
    break;
  case "test":
    actu_env = "env_test";
    break;
  default:
    actu_env = "env";
}

for (apps_keys in apps.apps) {
  if (apps.apps.hasOwnProperty(apps_keys)) {
    let name = apps.apps[apps_keys].name;
    apps.apps[apps_keys] = Object.assign(apps.apps[apps_keys], config[name]);
  }
}

function get_hub_cfg(config) {
  if (config.hasOwnProperty("spinal-core-hub")) {
    return config["spinal-core-hub"];
  }
  return null;
}

let hub_cfg = get_hub_cfg(config);

if (hub_cfg) {
  for (apps_keys in apps.apps) {
    if (apps.apps.hasOwnProperty(apps_keys)) {
      if ("spinal-core-hub" === apps.apps[apps_keys].name) continue;
      merge_config_rec(hub_cfg, apps.apps[apps_keys]);
    }
  }
}

for (apps_keys in apps.apps) {
  if (apps.apps.hasOwnProperty(apps_keys)) {
    let port = extract_port(apps.apps[apps_keys]);
    if (port != null) {
      apps.apps[apps_keys].name = apps.apps[apps_keys].name;
    }
  }
}

function merge_config_rec(default_config, dest) {
  for (var key in default_config) {
    if (!dest.hasOwnProperty(key)) {
      dest[key] = default_config[key];
    } else if (typeof default_config[key] == "object") {
      merge_config_rec(default_config[key], dest[key]);
    }
  }
}

function extract_port(cfg) {
  if (
    cfg.hasOwnProperty(actu_env) &&
    cfg[actu_env].hasOwnProperty("SPINALHUB_PORT")
  ) {
    return cfg[actu_env].SPINALHUB_PORT;
  }
  return null;
}

module.exports = apps;
