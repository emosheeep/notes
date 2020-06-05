---
title: HTTP缓存
---

# HTTP缓存

## 强缓存

### Cache-Control（HTTP/1.1）

#### 通用字段

- no-cache：本地可以缓存，但是每次使用都要向服务器验证，无论是否过期
- no-store：完全不可以缓存，每次都要去服务器拿最新的值
- max-age：客户端浏览器缓存时间
- no-transform: 禁止代理改动返回的内容，如禁止代理服务器压缩图片

#### 请求字段

- max-stale：（宽容）代理缓存过期不要紧，只要在时间限制内就行
- min-fresh：（限制）代理缓存需要一定新鲜度，要提前拿，否则拿不到
- only-if-cached：客户端只接受代理服务器的缓存，不会去源服务器拿，代理过期则直接返回504（Gateway Timeout）

#### 响应字段

- public：所有中间层都可以缓存（客户端，代理）
- private：只有客户端可以缓存
- s-maxage：代理服务器缓存时间（会覆盖max-age,expires）
- must-revalidate：缓存过期之前可以直接使用，一旦过期必须向服务器验证。会忽略max-stale头部
- proxy-revalidate：中间服务器接收到客户端带有这个头部的请求时，在返回数据前先去源服务器验证缓存的有效性。
- vary：vary是作为响应头由源服务器返回数据时添加的，其值就是当前请求的首部字段，如：Accept，User-Agent等，代理服务器会一并缓存Vary头部的和头部相关的内同。作用是**告诉下游服务器如何正确匹配缓存**。

#### 关于vary头部
不同客户端需要的内容可能是不一样的，如有的支持gzip，有的不支持。服务器提供的同一个接口，客户端进行同样的网络请求，对于不同种类的客户端可能需要的数据不同，服务器端的返回方式、返回数据也会不同，所以会通过`Accept-Encoding，User-Agent`等信息区别对待。

假如针对`IE6`和`Chrome`需要使用不同的编码方式传输，代理服务器中如果只判断同一个接口和请求，就很有可能导致两个浏览器拿到同样的数据，毫无疑问会导致一些列问题，如乱码等。同一个PC端和移动端应用也是如此，你提供给移动端和PC端的内容可能不同，代理服务器可以通过判断`Vary`的`User-Agent`来防止移动端误用PC端缓存。`Vary`头部的作用就体现在这里，通过其包含的请求头信息来有区别的匹配缓存。

具体参考：[MDN - Vary](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Vary) ，[HTTP请求的响应头部Vary的理解](https://blog.csdn.net/qq_29405933/article/details/84315254)

### Expires（HTTP/1.0）

**受限于客户端时间**，需要配合`last-modified`使用。且客户端时间与服务器时间不同步可能会导致缓存失效。属于HTTP/1的历史遗留产物，现阶段仅用于兼容。

### Pragma: no-cache（HTTP/1.0）

同为`HTTP/1`历史遗留产物，一般只在为了兼容HTTP/1的场合下使用。其在HTTP响应中的行为并没有被确切规范。若`cache-control`不存在的话，其行为与`cache-contorl: no-cache`一致。

## 协商缓存

协商缓存生效，返回304（Not Modified）响应。若协商缓存失效，返回200和请求结果。

### Last-Modified/If-Modified-Since/If-Unmodified-Since

若浏览器检测到响应头中的`Last-Modified`头部，且强缓存未命中时，在下次资源请求时添加请求头`If-Modified-Since`，其值对应`Last-Modified`的值，若服务器资源修改时间与`If-Modified-Since`不等，说明资源变动，协商缓存失效，返回新的资源。此外，`If-Unmodified-Since`顾名思义。



**缺点**：`Last-Modified`只能以秒计时若在一秒内修改多次，服务器是感知不到的，这会导致不能正确发送最新新资源到客户端

### E-Tag/If-Match/If-None-Match

服务器响应请求时，通过哈希算法计算出文件的一个唯一标识，并附带在`E-Tag`响应头中，只要资源变化，E-Tag就会重新生成。同样的，在未命中强缓存且检测到E-Tag的时候，浏览器就会为请求附加`If-Match/If-None-Match`请求头，其值对应`E-Tag`，若验证成功则返回304。

**缺点**：`E-Tag`的计算，会消耗服务器的性能，若资源频繁变动，则服务器需要频繁计算。

### E-Tag和Last-Modified的比较

1. `E-Tag`精度更高，但性能相对于`Last-Modified`稍逊一筹
2. 二者同时存在时优先考虑`E-Tag`

## 策略

1. 对于频繁变动的资源，我们应该优先考虑使用协商缓存。虽不能减少HTTP请求，但能够显著减小响应体积。甚至部分数据禁止缓存，永远要获取最新值，如股市动态等。
2. 对于几乎不变的资源，优先考虑强缓存。设置一个非常大的`max-age`等等。例如网站logo等。

## 缓存来源

### Service Worker

Service Worker基于HTTPS，且可以拦截全站请求以判断资源是否缓存，若缓存命中则直接使用，否则使用fetch获取最新资源。与浏览器内建缓存策略不同的是，Service Worker可以**自定义**哪些资源需要缓存，如何匹配缓存，如何读取缓存，且缓存是持续性的。其生命周期中主要使用：

1. install 事件：抓取资源进行缓存
2. activate 事件：遍历缓存，清除过期的资源
3. fetch 事件：拦截请求，查询缓存或者网络，返回请求的资源

具体参考：[MDN - Service Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)

### Memory Cache

读取速度极快，微秒级速度，但容量较小，且时效性差，一般关闭当前Tab标签页就会失效（随进程释放）。

### Disk Cache

比Memory Cache容量大，可缓存的时间也更长。

# HTML5离线缓存

## manifest

HTML5离线缓存主要通过`html`元素的`manifest`属性指定一个后缀为`manifest`的文件，该文件为网页指定哪些文件需要被缓存，哪些不需要缓存，以及获取失败的处理方式等等，该文件主要包含四个部分：

1. CACHE MANIFEST：标题，位于文件首行，如果没有指定标题，会导致文件解析失败

2. CACHE：该部分指定需要缓存的文件列表，内容为相对路径，对应`html`文件中引入的路径，一般来说主文档无需添加，默认缓存。

3. NETWORK：指定不需要缓存的文件，即永远从服务端获取。

4. FALLBACK：指定文件获取失败后的处理方式。如：

```
CACHE MANIFEST

CACHE:
./js/main.js
./css/main.css

NETWORK:
signup.html # 不缓存登陆页面

FALLBACK:
signup.html offline.html
# 当无法获取到该路径下的请求时，所有请求都会被转发到default.html文件来处理
/app/ajax/ default.html
```

  其工作流程大致如下：

1. 首次访问页面，浏览器加载页面和所需资源
2. 解析到`html`元素的`manifest`文件，加载`CACHE`以及`FALLBACK`对应的资源到缓存中
3. 从现在起你将完全使用浏览器缓存中的文件，即使强制刷新也不会生效。随后浏览器会尝试检查`manifest`文件是否更新（联机状态才会检查）。若`manifest`文件更新，浏览器会下载所有资源并更新缓存。
4. 离线状态下访问已缓存的资源时，浏览器会从缓存中读取，而相应的，访`NETWORK`中的资源则会对应读取`FALLBACK`。

**注意点**：只有`manifest`文件更新，浏览器才会重新下载新资源，意味着仅仅更改资源文件内容是不会触发更新的。这一问题可以通过在`manifest`中添加**版本注释**来解决。且更新缓存并不会立即生效，需**下次访问生效**！可通过浏览器API监听相应的事件，提醒用户刷新浏览器。

## applicationCache API

这是一个操作缓存的浏览器接口，`window.applicationCache`对象可以触发一系列与缓存状态相关的事件，其status属性0~5也对应了不同的状态，这里不展开了就：

```javascript
window.applicationCache.oncached = function (e) {
  console.log('cached!')
}
window.applicationCache.onchecking = function (e) {
  console.log('checking!')
}
window.applicationCache.ondownloading = function (e) {
  console.log('downloading!')
}
window.applicationCache.onerror = function (e) {
  console.log('error!', e)
}
window.applicationCache.onnoupdate = function (e) {
  console.log('noupdate!')
}
window.applicationCache.onupdateready = function (e) {
  console.log('updateready!')
}
```