const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');
const Promise = require('bluebird');
const vagrant = Promise.promisifyAll(require('node-vagrant'));

const start = require('./start');

const { commands, modules } = require('../../baker');
const spinnerDot = modules['spinnerDot'];
const spinner = modules['spinner'];
const boxes = modules['boxes'];
const baker = modules['baker'];

module.exports.resolveBakerlet = async function(bakerletsPath,remotesPath,doc,bakerScriptPath,verbose)
{

    //let doc;
    try {
        //doc = yaml.safeLoad(
        //    fs.readFileSync(config, 'utf8')
        //);

        if( verbose ) console.log( doc );

        let extra_vars = [];
        if( doc.vars )
        {
            extra_vars = doc.vars;
        }

        if( doc.lang )
        {
            for (var i = 0; i < doc.lang.length; i++)
            {
                await resolve(doc.name, bakerScriptPath, remotesPath, path.join(bakerletsPath,"lang"), doc.lang[i], extra_vars, verbose);
            }
        }

        if( doc.config )
        {
            for (var i = 0; i < doc.config.length; i++)
            {
                await resolve(doc.name, bakerScriptPath, remotesPath, path.join(bakerletsPath,"config"), doc.config[i], extra_vars, verbose);
            }
        }

        if( doc.services )
        {
            for (var i = 0; i < doc.services.length; i++)
            {
                await resolve(doc.name, bakerScriptPath, remotesPath, path.join(bakerletsPath,"services"), doc.services[i], extra_vars, verbose);
            }
        }

        if( doc.tools )
        {
            for (var i = 0; i < doc.tools.length; i++)
            {
                await resolve(doc.name, bakerScriptPath, remotesPath, path.join(bakerletsPath,"tools"), doc.tools[i], extra_vars, verbose);
            }
        }

        if( doc.packages )
        {
            for (var i = 0; i < doc.packages.length; i++)
            {
                await resolve(doc.name, bakerScriptPath, remotesPath, path.join(bakerletsPath,"packages"), doc.packages[i], extra_vars, verbose);
            }
        }

        if( doc.start )
        {
            let dir = path.join(boxes, doc.name);
            let vm = vagrant.create({ cwd: dir });
            let vmSSHConfigUser = await baker.getSSHConfig(vm);

            console.log("Starting command", doc.start);
            start(doc.start, vmSSHConfigUser, verbose);
        }



    } catch (error) {
        throw `Error: ${error}`
    }
}

function isObject(obj)
{
    return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]'
}

async function getSSHConfig(machine) {
    try {
        let sshConfig = await machine.sshConfigAsync();
        if(sshConfig && sshConfig.length > 0){
            return sshConfig[0];
        } else{
            throw '';
        }
    } catch (err) {
        throw `Couldn't get private ssh key of machine ${err}`;
    }
}

async function resolve(vmName, bakerScriptPath, remotesPath, dir, bakerlet, extra_vars, verbose)
{
    let mod = "";
    let version = "";
    if( isObject(bakerlet) )
    {
        // complex objects, like templates.
        mod = dir + "/" + Object.keys(bakerlet)[0];
    }
    else
    {
        let regex = /([a-zA-Z-]+)([0-9]*\.?[0-9]*)/;
        mod =  dir + "/" + bakerlet;
        let match = bakerlet.match(regex);
        version = null;
        if( match.length == 3)
        {
            mod =  dir + "/" + match[1];
            version = match[2];
        }
        if( verbose ) console.log("Found", mod, version);
    }

    let classFoo = require(mod)

    const boxes = path.join(require('os').homedir(), '.baker');
    const ansible = path.join(boxes, 'ansible-srv');
    let machine = vagrant.create({ cwd: ansible });
    let ansibleSSHConfig = await getSSHConfig(machine);

    let j = new classFoo(vmName, ansibleSSHConfig, version);
    j.setRemotesPath(remotesPath);
    j.setBakePath(bakerScriptPath);
    j.setVerbose(verbose);

    await spinner.spinPromise(j.load(bakerlet,extra_vars), `Preparing ${mod} scripts`, spinnerDot);
    await spinner.spinPromise(j.install(), `Installing ${mod}`, spinnerDot);
}