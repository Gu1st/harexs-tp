#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import minimist from 'minimist'
import prompts from 'prompts'
import {
    cyan,
    green,
    red,
    reset,
    yellow
} from 'kolorist'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const argv = minimist(process.argv.slice(2), {
    alias: {
        template: ['t'],
        file: ['f']
    }
})
//得到命令执行目录
const cwd = process.cwd()

const VERSIONS = [
    {
        name: 'v2',
        color: yellow,
    },
    {
        name: 'v3',
        color: green,
    },
    {
        name: 'v3-ts',
        color: cyan,
    }
]
const TEMPLATES = VERSIONS.map(item => item.name)
let targetFile = ''

//自执行init
async function init() {
    //指定文件名
    let fileName = argv.file || argv.f
    //目录
    let dirName = argv.dir || argv.d
    //模板
    let template = argv.template || argv.t

    let result = {}

    try {
        result = await prompts(
            [
                {
                    type: fileName ? null : 'text',
                    name: 'filename',
                    message: reset('Vue file name:'),
                    initial: 'index',
                    onState: (state) => {
                        fileName = state.value.trim()
                    }
                },
                {
                    type: dirName ? null : 'confirm',
                    name: 'needstodir',
                    message: () => `Do you need to create a directory?`
                },
                {
                    type: (prev) => {
                        if (!dirName && (prev === true)) {
                            return 'text'
                        }
                        return null
                    },
                    name: 'dirname',
                    message: () => `Create directory name:`,
                    onState: (state) => {
                        dirName = state.value.trim()
                    },
                    validate: (dir) => isVaildDirectoryName(dir) || 'Invalid Directory Name!'
                },
                {
                    type: (_, { needstodir }) => {
                        if ((needstodir === true) || dirName) {
                            //指定了目录后 判断目录是否占用
                            targetFile = path.resolve(dirName, `${fileName}.vue`)
                            if (fs.existsSync(targetFile)) {
                                return 'confirm'
                            }
                        } else {
                            targetFile = path.resolve(`${fileName}.vue`)
                            if (fs.existsSync(targetFile)) {
                                return 'confirm'
                            }
                        }
                        return null
                    },
                    name: 'overwrite',
                    message: () => `${fileName}.vue File Already exists,Remove existing file and continue?`
                },
                {
                    type: (_, { overwrite }) => {
                        //这里用=== 是因为 null的话 这里是undefined
                        if (overwrite === false) {
                            throw new Error(red('✖') + ' Operation cancelled')
                        }
                        return null
                    },
                    name: 'overcheck',
                },
                {
                    type: template && TEMPLATES.includes(template) ? null : 'select',
                    name: 'version',
                    message:
                        typeof template === 'string' && !TEMPLATES.includes(template)
                            ? reset(
                                `"${template}" isn't a vue template valid. Please choose from below: `
                            )
                            : reset('Select Vue version:'),
                    initial: 0,
                    choices: VERSIONS.map((item) => {
                        const Color = item.color
                        return {
                            title: Color(item.name),
                            value: item.name
                        }
                    })
                },
            ],
            {
                onCancel: () => {
                    throw new Error(red('✖') + ' Operation cancelled')
                }
            }
        )
    } catch (cancelled) {
        console.error(cancelled.message)
        return
    }

    const { overwrite, version, needstodir } = result
    template = version || template


    const userFolder = dirName ? path.join(cwd, dirName) : cwd
    const templateFile = path.join(__dirname, 'template', `${template}.vue`)

    if (overwrite) {
        fs.rmSync(targetFile)
    } else if (needstodir || !fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder)
    }

    fs.copyFileSync(templateFile, targetFile)

    console.log(green(`\nDone. Create ${fileName}.vue Complete!\n`))
}

init().catch(err => {
    console.error(red(err.message))
})

//utils
function isVaildDirectoryName(dir) {
    return !(/[\\\/:?"<>|]+/g.test(dir))
}