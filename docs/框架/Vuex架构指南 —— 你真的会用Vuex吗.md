---
title: Vuex 架构指南
---

# 前言

最近，在和朋友们协作的时候，暴露了许多问题，这其中最让人头疼的应该是，**代码组织问题**。

代码组织能力会随着知识面的拓展逐渐养成，但是在这个过程中，你是否看过优秀的、让人眼前一亮的代码，并从中获得感悟，很大程度上影响着最终代码组织能力的强弱。这并不单单看你的阅历，和做过项目的多少，而是有意识地，主动地通过阅读优秀的源码，从别人那里学来的一种软实力。

可是我在网上并没有找到很多类似的文章，于是决定自己写一篇，基于最近在做的竞赛管理系统项目，梳理一下Vuex在项目中运用，总结出一些通用的东西。**我不敢说自己的方式是最棒的，但相信能对大家有所帮助。**

> 转载请附上原文链接，支持原创

# 项目简介

名称： 竞赛管理系统

功能简介：用户信息增删改查、赛事信息增删改查、参赛记录增删改查、附件上传、成绩审核等。

技术栈（前端）：Vue全家桶 + ant-design-vue

项目地址：[GitHub](https://github.com/1446445040/competition-system)

# 项目组织 —— Vuex部分

> Vuex 并不限制你的代码结构。但是，它规定了一些需要遵守的规则：
>
> 1. **应用层级的状态**应该集中到单个 store 对象中。
> 2. 提交 **mutation** 是更改状态的唯一方法，并且这个过程是同步的。
> 3. 异步逻辑都应该封装到 **action** 里面。
>
> 只要你遵守以上规则，如何组织代码随你便。如果你的 store 文件太大，只需将 action、mutation 和 getter 分割到单独的文件。
>
> —— 摘自[官方文档](https://vuex.vuejs.org/zh/guide/structure.html)

所谓**应用层级的状态**，在本项目中即为：用户信息，赛事信息，参赛记录。

将状态作为应用级的状态的标准，可以考虑**该状态是否为所有组件或多个组件共用**，或者你已经**为了让这个状态在组件间通信耗费了巨大的精力**。如果是这样，就大胆地应用吧。

下面从Store说起。

## Store

作为管理系统，少不了增删改查。以管理员为例，管理员的任务是对用户信息（users）、赛事信息(races)、参赛记录(records)进行增删改查。使用Vuex我们首先需要创建一个store目录。

```javascript
── store
    ├── index.js          # 我们组装模块并导出 store 的地方
    ├── actions.js        # 根级别的 action
    ├── mutations.js      # 根级别的 mutation
    ├── races             # races 模块
    │   ├── index.js      # 导出module
    │	  ├── mutations.js  # module 级别的mutations
    │   └── actions.js    # module 级别的actions
    ├── users
    │   ├── index.js
    │	  ├── mutations.js
    │   └── actions.js
    └── records
        ├── index.js
        ├── mutations.js
        └── actions.js
```

由于每一种数据都涉及增删改查操作，我选择使用[Vuex中的Module](https://vuex.vuejs.org/zh/guide/modules.html)来组织他们。每个文件夹导出一个module，最终汇总到外部的index中，进而导出store对象，注册Vuex。

每一个模块都有一个action和一个mutation，action用来发送请求，mutation根据请求结果修改state（由于state结构简单，我直接写在了模块内部），最终将变化体现到视图上。

下面以赛事信息数据（races）示例：

## Races

以下三段代码对应races目录下：`races/index.js，races/actions.js，races/mutations.js`

```javascript
/**
 * index.js
 */
import actions from './actions'
import mutations from './mutations'

// 这里到处races模块，并在store/index.js中注册为module
export default {
  namespaced: true, // 设置命名空间只是为了使模块更加独立，具体可以参考官方文档
  state: {
    races: []
  },
  mutations,
  actions
}
```

```javascript
/**
 * actions.js
 */
import { SET_RACE_LIST, ADD_RACE, UPDATE_RACE, DELETE_RACE } from '../mutation-types'
import { getRaceList, addRace, updateRace, deleteRace } from '../../api'
import { message } from 'ant-design-vue'

export default {
  [SET_RACE_LIST] ({ commit }, params) {
    return new Promise((resolve, reject) => {
      getRaceList(params).then(({ data: races }) => {
        resolve(races)
        commit(SET_RACE_LIST, races)
      }).catch(e => {
        reject(e)
        message.error('系统错误，请重试')
      })
    })
  },
  [ADD_RACE] ({ commit }, race) {
    const stopLoading = message.loading('请稍后')
    return new Promise((resolve, reject) => {
      addRace(race).then(({ data }) => {
        resolve(data)
        commit(ADD_RACE, data)
        message.success('添加成功')
      }).catch(e => {
        reject(e)
        message.error('系统错误，请重试')
      }).finally(() => {
        stopLoading()
      })
    })
  },
  [UPDATE_RACE] ({ commit }, race) {
      ...
  },
  [DELETE_RACE] ({ commit }, _id) {
    ...
  }
}
```

```javascript
/**
 * mutations.js
 */
import { SET_RACE_LIST, ADD_RACE, UPDATE_RACE, DELETE_RACE } from '../mutation-types'

export default {
  [SET_RACE_LIST] (state, races) {
    state.races = races
  },
  [ADD_RACE] (state, race) {
    state.races.push(race)
  },
  [UPDATE_RACE] (state, race) {
    state.races = state.races.map(item => {
      return item._id === race._id ? race : item
    })
  },
  [DELETE_RACE] (state, _id) {
    state.races = state.races.filter(item => item._id !== _id)
  }
}
```

看了上面这些代码，可能你会有以下疑问

### mutation-types是什么？

```javascript
/**
 * mutation-types.js —— 主要是定义一些常量
 */
export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const REFRESH_TOKEN = 'REFRESH_TOKEN'

// races 模块
export const SET_RACE_LIST = 'SET_RACE_LIST'
export const ADD_RACE = 'ADD_RACE'
export const UPDATE_RACE = 'UPDATE_RACE'
export const DELETE_RACE = 'DELETE_RACE'

...
...
```

mutation-types定义的其实就是action和mutation的方法名，在这里定义，再引过去，使用【中括号语法】定义方法，可以**保证同一类操作的名字不会写错**，减少因此产生的bug，同时还能享受编译器的语法提示，很香的。

实际上这些常量的值具体是什么并不重要，只要不重复就行，一般会和变量名相同。还可以使用ES6中的Symbol来实现。

他们的目的主要有两点：

1. 使得vuex的函数调用更具语义化
2. 减少由于名字写错引发的bug

可能你要问了，变量名和变量值是一样的，为什么不直接使用字符串呢？举例如下：

```javascript
import { ADD_RECORD } from 'mutation-types'
store.dispatch(ADD_RECORD) // 如果写错，编译器会报错，直接发现错误，当场改正
store.dispatch('ADD_RECORD') // 编译器不会报错，如果写错，运行时才能发现
```

其实如果你直接使用字符串，即便发现了错误，你也不一定知道是在哪里写错的，因为这样会使得代码中到处都是字符串，谁能保证都写对了呢？而且官方也是推荐使用这种方式来维护日趋庞大的项目得，有图有真相：

![vuex官方推荐使用mutation-types的方式](/images/mutation-types.png)

什么？你只是个小demo？好的没问题，下一个👌。

大型项目中，为了便于后期的项目维护，**多次出现的常量一定要提取出来，单独定义**。小demo请自便。

### action写什么？

Action 类似于 mutation，不同在于：

- Action 提交的是 mutation，而不是直接变更state。
- Action 可以包含任意异步操作

这是官方给出的定义。在官方的示例文档中，我们可以看到很多种使用方式。其中组合使用Action的方式值得大家留意，**Action返回一个Promise对象**就可以自由地和业务逻辑进行组合。如此一来，我们在组件中就可以自定义很多逻辑，如自定义loading状态：

```javascript
import { GET_RACE_LIST } from 'mutation-types'
export default {
	mounted () {
        this.loading = true
    	this.$store.dispatch(GET_RACE_LIST).finally(() => {
            this.loading = false
        })
	}
}
```

在上面`races/action.js`的代码中，引入了`ant-design-vue`中的`message api`。根据请求结果不同做出不同的提示，成功反馈，错误处理等等。这样一来，组件中只需要调用`store.dispatch()`发出请求，并基于请求结果做一些和组件有关的事情即可，跟数据有关的事情由action配合mutation自动处理好。组件中只要关注组件本身的逻辑就可以了。

## API

在`races/actions.js`中有这样一行代码

```javascript
import { getRaceList, addRace, updateRace, deleteRace } from '../../api'
```

API是单独封装的，理由很简单，一是为了复用，二是为了解决类似`mutation-types`的常量引用问题。试想如果每一次发请求都要将请求地址完整的写上，那么请求地址如果变化了，你一定会疯掉的，甚至逼到你使用全局搜索来进行替换，这无疑是低效的。

这是我的API目录结构

```javascript
api
  ├── index.js          # 导出api
  ├── handle404.js      # 配合axios.js处理响应拦截
  └── axios.js          # 导出axios对象，做一些全局配置，如请求拦截，响应拦截，baseUrl等
```

大致是这样，具体因业务不同而异，下面看看`index.js`的内容：

``` javascript
/**
 * index.js  定义接口
 */
...
...
export const getRaceList = params => axios.get('/race/list', { params })
export const addRace = data => axios.post('/race/add', data)
export const updateRace = data => axios.put('/race/update', data)
export const deleteRace = _id => {
  return axios.delete('/race/delete', { data: { _id } })
}
...
...
```

关于`axios.js`和`handle404.js`的内容，涉及全局拦截和token无状态刷新，感兴趣的朋友可以看我的另一篇文章 —— [登陆验证实践 —— Token & Refresh Token](https://juejin.im/post/5ed98d0ce51d45784a356052)。

# 后记

曾几何时，被问起项目经验时，心底里都有一个疑问：什么是项目？

我想起了大一时的自己，那时候我觉得项目就是特别高大上的东西，由很多文件组成，彼此之间存在着复杂的关系，一定是很多人一起协作才能搞得出来的。可现在我明白，所谓项目，无非是一个功能集合。分离出的文件最终都会合起来，实现一个完整的功能，而之所以分开，是为了维护方便。从这点上说，项目无论大小，只要是一个完整的功能，都可以称作项目，哪怕只有一个简单的`index.html`文件。

当然啦，本文针对的主要还是大型项目中的代码组织方式，小demo的话怎么舒服怎么来。毕竟代码风格这种东西因人而异，我们不能说谁的代码写的漂亮就一定好。总的来说，良好的代码风格，有助与排查错误，有利于团队协作，有利于修身养性，有助于...（跑偏了）总之好处不会少。

最后，希望能对大家有所帮助，**转载请附上原文链接**

# 参考

[Vuex 官方文档](https://vuex.vuejs.org/zh/)