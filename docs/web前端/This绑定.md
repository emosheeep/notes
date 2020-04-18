# 写在前面
this用好了可以让你的代码简洁而又灵活，但用不好可以让你的bug难以追踪。最近做题的时候总是遇到关于this指向的问题，而偏偏我还就做不对。

为了永诀后患特地花了一天时间好好总结了一下。本文内容参考自《你不知道的JavaScript》上卷，在阅读理解的基础上加工而成。

听没听懂都给个赞吧😄

# 一道试题
正如标题所说，this绑定的方式一共有四种。也许日常使用你可以凭借经验用的很6，但真的做起题目来，未必得心应手，甚至连蒙带猜。下面先看一道题目:

```javascript
var name = 'global';
function foo () {
    this.name = 'foo';
}
var obj = {
    name: 'local',
    bar: foo.bind(window),
    foo: foo
};

var baz = new obj.bar();
console.log(window.name); // global
console.log(baz.name); // foo (new 绑定)
obj.bar()
console.log(window.name) // foo（显示绑定）
obj.foo()
console.log(obj.name) // foo (隐式绑定)
```
如果你能爽快答出，并且正确，那你可以走了。如果不能，那么继续。
# 默认绑定
默认绑定作用于函数直接调用的情况下，此时this指向全局对象，但严格模式下this指向undefined。
```javascript
function foo () {
    console.log(this)
}
foo() // => window

// 严格模式
function bar () {
    'use strict'
    console.log(this)
}
bar() // => undefined
```
注意函数直接调用，不跟前缀，该方式容易和隐式绑定弄混。

# 隐式绑定
this指向它的调用者，即谁调用函数，他就指向谁。

示例：
```javascript
function foo () {
    console.log(this)
}
const obj = {
    foo: foo
}

obj.foo() // => obj调用foo，则this指向obj
foo() // => window。这是默认绑定还是隐式绑定？
```

这里如果直接调用foo，结果将会是window，那这种方式算作默认绑定，还是隐式绑定呢？请看下面：

```javascript
const obj = {
    a: function () {
        consooe.log(this) // ① obj（隐式）
        function b () {
            console.log(this) // ② window（默认）
        }
        b()
    }
}
obj.a()
```
出乎意料的是，②处的结果是window，并不是obj。原因很简单，因为b()是直接调用的（没有前缀）。

## 区分隐式绑定和默认绑定
在第一段代码中直接调用`foo()`，this之所以指向window，是因为foo是直接调用的并不依附于谁。

但是由于全局变量的特殊性（全局变量是window的属性），`foo()`等价于`window.foo()`，所以这里可以有两种解释方式：
1. window调用了foo()，this指向window。隐式绑定
2. foo是直接调用的，this默认绑定为window。默认绑定

但在第二段代码中就不一样了，②处的结果就是默认绑定

## 隐式绑定的this丢失问题
常见于传入回调函数时。如：
```javascript
const obj = {
    foo: function () {
        console.log(this)
    }
}
setTimeout(obj.foo, 0) // => window
setTimeout(function () {
    obj.foo() // => obj
}, 10)
```
为什么做回调函数时就不对了？这两段代码有什么不一样？

函数也是引用类型，obj.foo作为参数传递给其他函数时，传递的是引用，所以传递的就是这个标识对应的匿名函数本身，和其所处的位置无关，在不在obj中都无所谓，哪怕n层嵌套。

明白这点我们就可以很好地解释：第一个setTimeout，obj.foo引用的是匿名函数本身，**这其实是一个不带任何修饰的函数调用，因此应用了默认绑定**，导致我们意料之外的this丢失。

由于this会丢失，很大程度上限制了我们的应用场景，但我们可以使用显式绑定来解决这个问题，如：
```javascript
setTimeout(obj.foo.bind(obj), 0) // => obj
```

# 显示绑定
就像我们刚才看到的那样，在分析隐式绑定时，我们必须在一个对象内部包含一个指向函数的属性，并通过这个属性间接引用函数，从而把 this间接（隐式）绑定到这个对象上。

那么如果我们不想在对象内部包含函数引用，而想在某个对象上强制调用函数，该怎么做呢？答案是**通过call、apply或bind实现**。

```javascript
function foo() {
    console.log( this.a );
} 
 
var obj = {
    a: 2
}; 
 
foo.call( obj ); // => 2
foo.apply( obj ); // => 2

var tmp = foo.bind(obj)
tmp() // => 2
```
这些都是常规操作，但是有三点需要注意：
1. call和apply是立即执行，bind则是返回一个绑定了this的新函数，只有你调用了这个新函数才真的调用了目标函数
2. bind函数存在多次绑定的问题，如果多次绑定this，则以第一次为准。
3. bind函数实际上是显示绑定（call、apply）的一个变种，称为硬绑定。由于硬绑定是一种非常常用的模式，所以在 ES5 中提供了内置的方法`Function.prototype.bind`

## 硬绑定
简单解释下第二点，为什么以第一次为准
```javascript
function foo() {
    console.log( this.a );
} 
var obj1 = {
    a: 'obj1'
}; 
var obj2 = {
    a: 'obj2'
}

var tmp = foo.bind(obj1).bind(obj2)
tmp() // => 'obj1'
tmp.call(obj2) // => 'obj1'
```
为什么以第一次为准？实际的bind函数大家可以参考[MDN的polyfill](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)，为了便于理解，bind函数可以简化为：
```javascript
Function.prototype.bind = function (context, ...args) {
    const fn = this // 这个this就是我们绑定的函数，如上例即foo
    return function (...props) {
        fn.call(context, ...args, ...props)
    }
}
```
可以看到，bind就是给函数套一层函数，利用柯里化，提前设置好上下文对象。根据这个原理，可以知道，无论你外面包裹了多少层，目标函数不会变。且由于闭包的存在，最初的这个context对象也不会变，所以当包裹在外层的函数一层层褪去后，**最终使用到的context对象依旧是第一次绑定的对象**。

bind函数只能绑定一次，多次绑定是没有用的，绑定后的函数this无法改变，即使call也不行，所以才称作硬绑定。

不过凡事总有例外，且看new绑定。

# new绑定
> 在传统的面向类的语言中，“构造函数”是类中的一些特殊方法，使用 new初始化类时会 调用类中的构造函数。JavaScript 也有一个 new操作符，使用方法看起来也和那些面向类的语言一样，绝大多数开 发者都认为 JavaScript 中 new 的机制也和那些语言一样。然而，JavaScript 中 new 的机制实 际上和面向类的语言完全不同。

使用new操作符时实际做了四件事：
1. 创建一个全新的对象
2. 执行原型链接
3. 这个新对象会被绑定到构造函数中的this
4. 执行构造函数，判断返回值，如果为对象，则返回这个值，否则返回默认创建的对象


# 优先级
如果某个调用位置可以应用多条规则该怎么办？为了解决这个问题就必须给这些规则设定优先级，这就是我们接下来要介绍的内容。

毫无疑问，默认绑定的优先级是最低的，显式绑定和隐式绑定的优先级，通过上面的例子也可以证明，显式大于隐式。所以目前顺序是：`显式 > 隐式 > 默认`

那我们来测试下显示绑定和new绑定的优先级顺序。由于call/apply无法和new一起使用，我们可以使用bind（硬绑定）来验证。

```javascript
function foo() {
    this.a = '哈哈哈';
} 
var obj = {
    a: 'obj'
}; 

var tmp = foo.bind(obj)
var result = new tmp()
console.log(obj.a) // => 'obj'
console.log(result.a) // => '哈哈哈'
```
显而易见的，new的优先级，大于显示绑定。**最终顺序为：new > 显式 > 隐式 > 默认**。

于是我们判断this，就有了一个顺序：
1. 函数是否在new中调用？
2. 是否通过call、apply、bind等调用？
3. 是否在某个上下文对象中调用？
4. 都不是则是默认绑定。且严格模式下绑定到undefined。

对于正常的函数调用来说，理解了这些知识你就可以明白 this的远离了，不过，同样的，凡是总有例外嘛。

# 例外情况
## null或undefined
若将null、undefined等值作为call、apply的第一个参数，那么实际调用时会被忽略，从而应用到默认绑定规则，即绑定到window上，有些时候我们不关心上下文，只关心参数时，可以这样做。

但这样其实存在这一些潜在的风险，绑定到window很可能无意中添加或修改了全局变量，造成一些隐蔽的bug。所以为了防止这种情况出现，可以将第一个参数绑定为一个空对象。当然具体还是看需求，这只是建议。

## 软绑定
关于软绑定，其实就是用来解决硬绑定后this无法再修改的问题，可以看看这篇[关于软绑定](https://juejin.im/post/5b0417af518825426c692d54)的文章。其实现如下（摘自《你不知道的JavaScript》上卷）：
```javascript
Function.prototype.softBind = function(obj){
    var fn = this;
    var args = Array.prototype.slice.call(arguments,1);
    var bound = function(){
        return fn.apply(
            (!this || this === (window || global)) ? obj : this,
            args.concat.apply(args,arguments)
        );
    };
    bound.prototype = Object.create(fn.prototype);
    return bound;
};
```
主要关注这一行：
```javascript
// 判定当前this，如果绑定到了全局对象或undefined，null，
// 则修改this为传入的obj，否则什么也不做。
(!this || this === (window || global)) ? obj : this
```

意义何在？

```javascript
var name = 'global'
const obj = {
    name: 'obj',
    foo: function () {
        console.log(this.name)
    }
}
const obj1 = {
    name: 'obj1'
}

obj.foo() // => obj // 常规方式
setTimeout(obj.foo, 0) // this丢失，global
// 现在我们使用软绑定
const softFoo = obj.foo.softBind(obj)
setTimeout(softFoo, 0) // obj
softFoo.call(obj1) // obj1，可以使用call显式改变this
obj1.foo = softFoo
obj1.foo() // obj1，也可以隐式改变this
```
`setTimeout(softFoo, 0)`中softFoo同样会丢失this，但丢失后，通过内部判断我们将取上一步绑定的obj。

如果是硬绑定，则softFoo的this将被固定为obj，固定体现在始终应用第一次传入的这个上下文。

但是由于有了上面的判断，所以在应用隐式或显式规则时，由于this既不是全局对象也不是undefined或null，所以判断为false，取后者this，而在我们调用`softFoo.call(obj1)`时，this又被改变了，变成了obj1，然后就修改成功了。

这里这里的设计非常巧妙，需要仔细品味。注意我们的softFoo是调用softBind函数后返回的内部函数bound。还要注意softBind函数中第一行的this，和bound中的this，他们是不相等的。

可以看出，这个判断条件可以防止应用默认绑定规则，当应用了默认规则时，取前者。前者就是我们传入的目标上下文。否则便使用软绑定传入的上下文，就是我们的obj。

有了软绑定之后，排序为：**new > 显式 > 隐式 > 软绑定 > 默认**
## 箭头函数
1. 函数体内的this就是定义时所在的对象，而非调用时所在的对象，和普通函数相反。
2. 箭头函数无法用做构造函数，即不能使用new调用
3. 不能使用arguments对象，函数中不存在这个对象。
4. 不可使用yield命令，即无法用做Generator函数。

其中第一点尤其值得注意，之所以this是固定的，是因为箭头函数本身没有this，箭头函数的this不是自己的。所以不能修改，也正因为没有this，所以不能用作构造函数。这些限制都是因为没有this导致的。

# 总结
判断this主要有以下步骤：
1. 函数是否在new中调用？
2. 是否通过call、apply、bind等调用？
3. 是否在某个上下文对象中调用？
4. 都不是则是默认绑定。且严格模式下绑定到undefined。

另外还要注意箭头函数的特殊性以及undefined和null会被忽略这一特性。

如有错误，还请批评指正，谢谢！