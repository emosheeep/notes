---
title: VueRouter
---

# 过程简述

1. **插件安装**。调用`install`方法，方法内部使用`mixin`全局混入两个钩子：`beforeCreate`和`destroyed`。前者做路由初始化，后者卸载路由。

2. **创建路由表（createMatcher）**。路由表主要包括`pathList`，`pathMap`，`record`。作用是记录路由信息。

3. **路由匹配（match）**。通过当前的路径`path`在路由表中寻找对应的路由记录`record`。

4. **路由守卫（NavigationGuard）**。

5. **路由跳转（transitionTo）**：无论是哈希路由还是`history`路由，内部会做一个判断，如果支持`history`路由则会使用`pushState`来改变路径，否则降级处理，使用`location.href`

6. **组件渲染（RouterView）**：前面所做的都是对路由的匹配和更新，但是组件是在何处触发重新渲染的呢？答案是，在`install`混入的过程中，在`beforeCreate`钩子里调用了`defineReactive`函数，将route对象变成了响应式对象。


# 总结

vue-router始终维护当前路由，切换的时候，会从当前路由切换到目标路由。

- 会执行一系列的路由守卫钩子
- 会更改URL
- 还会渲染目标组件

切换完毕后会将当前路由替换为目标路由，作为下一次切换的依据。

