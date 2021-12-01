class ProgressComponent {
  constructor(adAddress,toAddress) {
      this.loadedInterval = null
      this.progressInterval = null
      this.endPlay = false;
      this.currentTime = 0;
      this.timeOuter = null;
      this.createStyle();
  }

  createEl(el){
      var html = document.createElement('div');
      html.className = 'custom-progress-container'
      html.innerHTML = '<div class="custom-progress-content">'+
          '<div class="custom-progress-total"></div>' +
          '<div class="custom-progress-loaded"></div>' +
          '<div class="custom-progress-played"></div>' +
          '<div class="custom-progress-marker" style="left:0"></div>' +
          '<div class="custom-progress-drag"></div>' +
      '</div>'
      this.container = html;
      el.getElementsByClassName('prism-controlbar')[0].appendChild(this.container);
  }
  created(player,e){
      this.loadedRun(player,e);
      if (!isMobile()) {
        this.mouseDown(player,e);
      } else {
        this.touchStart(player,e);
      }
      
  }
  
  ready(player,e){
  }

  // 计算缓冲进度
  loadedRun(player,e){
      this.loadedInterval = setInterval(() => {
          var loadedSpeed = 0;
          if(player.tag.buffered){
              loadedSpeed = player.tag.buffered.end(player.tag.buffered.length-1)/player.tag.duration;
          }
          
          if(player['loadedSpeed'] && loadedSpeed == 1){
              player['loadedSpeed'] = loadedSpeed
              this.container.getElementsByClassName('custom-progress-loaded')[0].style.width = '100%'
              clearInterval(this.loadedInterval);
              return
          }
          if(!player['loadedSpeed']){
              player['loadedSpeed'] = loadedSpeed;
              this.container.getElementsByClassName('custom-progress-loaded')[0].style.width = (player['loadedSpeed']*100) + '%'
          }else{
              if(player['loadedSpeed'] != loadedSpeed){
                  player['loadedSpeed'] = loadedSpeed;
                  this.container.getElementsByClassName('custom-progress-loaded')[0].style.width = (player['loadedSpeed']*100) + '%'
              }
          }
      }, 1000);
  }

  // 计算播放进度
  progressRun(player,e){
      var played = this.container.getElementsByClassName('custom-progress-played')[0];
      var point = this.container.getElementsByClassName('custom-progress-marker')[0];
      clearInterval(this.progressInterval);
      this.progressInterval = setInterval(() => {
          var status = player.getStatus();
          // 暂停的情况下不计算
          if(status != 'pause' && status != 'ended'){
              var w = this.container.offsetWidth;
              var currentTime = player.tag.currentTime;
              var duration = player.tag.duration;
              var present = currentTime / duration;

              if(!player['present']){
                  player['present'] = present;
                  played.style.width = (present*100) + '%';
                  point.style.left = (present*100) + '%';
              }else{
                  if(player['present'] != present){
                      player['present'] = present;
                      played.style.width = (present * 100) + '%';
                      point.style.left = (present*100) + '%';
                  }
              }
          }
          
      }, 1000);
  }

  // 拖动进度条
  mouseDown(player,e){
      var point = this.container.getElementsByClassName('custom-progress-marker')[0];
      var played = this.container.getElementsByClassName('custom-progress-played')[0];
      var drag = this.container.getElementsByClassName('custom-progress-drag')[0];
      var params = {
          flag: false,
          w: document.getElementById('app').offsetWidth
      }
      let self = this;
      drag.onmousedown = function(e){
          // 解决小米手机默认行为
          e.preventDefault();
          var e = e || window.event;
          // 鼠标按下就要计算，因为可能按下不拖动直接松开
          clearInterval(self.progressInterval);

          var width = self.container.getElementsByClassName('custom-progress-total')[0].offsetWidth;
          params.flag = true;
          params.w = width;
          var dragLeft = drag.getBoundingClientRect().left;
          var left = (e.clientX - dragLeft - 6);
          point.style.left = (left/params.w)*100 + '%';
          played.style.width = (left/params.w)*100 + '%';
          var deltaX = e.clientX - point.offsetLeft;
          self.endPlay = false;

          var present = (e.clientX - dragLeft)/params.w;
          self.currentTime = present * player.tag.duration;

          document.onmousemove = function(e){
              clearTimeout(self.timeOuter)
              var e = e || window.event;
              if(params.flag){
                  var nowleft = e.clientX - deltaX;
                  if (nowleft < 0) nowleft = 0;
                  if (nowleft > width - point.offsetWidth) {
                      nowleft = width - point.offsetWidth;
                  }
                  // 滑块
                  if(nowleft + 12 >= width){
                      point.style.left = ((nowleft-12)/params.w)*100 + '%';
                  }else{
                      point.style.left = (nowleft/params.w)*100 + '%';
                  }
                  played.style.width = (nowleft/params.w)*100 + '%';
                  
                  var present = nowleft/params.w;
                  self.currentTime = present * player.tag.duration;
              }
          }
          document.onmouseup = function(e){
              params.flag = false;
              if(player._el.getElementsByClassName('aliyun-replay-btn').length){
                  player._el.getElementsByClassName('aliyun-replay-btn')[0].remove()
              }
              self.setPlayerSeek(player,e);
              clearTimeout(self.timeOuter)
              self.timeOuter = setTimeout(()=>{
                player._el.getElementsByClassName('prism-controlbar')[0].style.display = 'none'
              }, 3000)
              document.onmouseup = null;
              document.onmousemove = null;
              
          }
      }
  }
  touchStart(player,e) {
    var point = this.container.getElementsByClassName('custom-progress-marker')[0];
    var played = this.container.getElementsByClassName('custom-progress-played')[0];
    var drag = this.container.getElementsByClassName('custom-progress-drag')[0];
    var params = {
        flag: false,
        w: document.getElementById('app').offsetWidth
    }
    let self = this;
    drag.ontouchstart = function(e){
      // 解决小米手机默认行为
      e.preventDefault();
      var e = e || window.event;
      // 鼠标按下就要计算，因为可能按下不拖动直接松开
      clearInterval(self.progressInterval);

      var width = self.container.getElementsByClassName('custom-progress-total')[0].offsetWidth;
      params.flag = true;
      params.w = width;
      var dragLeft = drag.getBoundingClientRect().left;
      var left = (e.touches[0].clientX - dragLeft - 6);
      point.style.left = (left/params.w)*100 + '%';
      played.style.width = (left/params.w)*100 + '%';
      var deltaX = e.touches[0].clientX - point.offsetLeft;
      self.endPlay = false;

      var present = (e.touches[0].clientX - dragLeft)/params.w;
      self.currentTime = present * player.tag.duration;
      document.ontouchmove = function(e){
        clearTimeout(self.timeOuter)
          var e = e || window.event;
          if(params.flag){
              var nowleft = e.touches[0].clientX - deltaX;
              if (nowleft < 0) nowleft = 0;
              if (nowleft > width - point.offsetWidth) {
                  nowleft = width - point.offsetWidth;
              }
              // 滑块
              if(nowleft + 12 >= width){
                  point.style.left = ((nowleft-12)/params.w)*100 + '%';
              }else{
                  point.style.left = (nowleft/params.w)*100 + '%';
              }
              played.style.width = (nowleft/params.w)*100 + '%';
              
              var present = nowleft/params.w;
              self.currentTime = present * player.tag.duration;
          }
      }
      document.ontouchend = function(e){
          params.flag = false;
          if(player._el.getElementsByClassName('aliyun-replay-btn').length){
              player._el.getElementsByClassName('aliyun-replay-btn')[0].remove()
          }
          self.setPlayerSeek(player,e);
          clearTimeout(self.timeOuter)
          self.timeOuter = setTimeout(()=>{
            player._el.getElementsByClassName('prism-controlbar')[0].style.display = 'none'
          }, 3000)
          document.ontouchend = null;
          document.ontouchmove = null;
          
      }
    }
  }
  setPlayerSeek(player,e){
      player.tag.currentTime = this.currentTime;
      this.progressRun(player,e);
  }
  play(player,e){
      if(this.endPlay){
          this.container.getElementsByClassName('custom-progress-played')[0].style.width = '0px';
          this.container.getElementsByClassName('custom-progress-marker')[0].style.left = '0px';
          this.endPlay = false;
      }
      player.tag.currentTime = this.currentTime;

      this.progressRun(player,e);
      if (!isMobile()) {
        this.mouseDown(player,e);
      } else {
        this.touchStart(player,e);
      }
      this.timeOuter = setTimeout(()=>{
        player._el.getElementsByClassName('prism-controlbar')[0].style.display = 'none'
      }, 3000)
  }
  ended(player,e){
      clearInterval(this.loadedInterval);
      clearInterval(this.progressInterval);
      this.container.getElementsByClassName('custom-progress-played')[0].style.width = '100%';
      this.container.getElementsByClassName('custom-progress-marker')[0].style.left = (this.container.offsetWidth-12) + 'px';
      this.endPlay = true;
      this.currentTime = 0;
  }
  pause(player,e){
      if(player.tag.currentTime != player.tag.duration && this.currentTime != 0){
          this.currentTime = player.tag.currentTime;
          this.endPlay = false;
          clearInterval(this.progressInterval);
      }else{
          setTimeout(() => {
              player._el.getElementsByClassName('prism-big-play-btn')[0].style.display = 'none';
          }, 300);
      }
  }
  /**
   * 播放器销毁
   * @param {*} player 
   * @param {*} e 
   */
  dispose(player, e) {
    clearInterval(this.progressInterval);
    clearInterval(this.loadedInterval);
  }

  isMobile() {
    let flag = navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    )
    return flag
  }

  /**
   * 插入css样式
   * @param {*} cssStyle 样式
   */
   insertCSS(cssStyle) {
      if(!document.getElementById('aliyun-custom-progress')){
          var style = document.createElement("style");
          style.id = 'aliyun-custom-progress';
          var theHead = document.head || document.getElementsByTagName('head')[0];
          style.type = "text/css";// IE需要设置
          if (style.styleSheet) {  // IE
              var ieInsertCSS = function () {
                  try {
                      style.styleSheet.cssText = cssStyle;
                  } catch (e) { }
              };
              //若当前styleSheet不能使用，则放到异步中
              if (style.styleSheet.disable) {
                  setTimeout(ieInsertCSS, 10);
              } else {
                  ieInsertCSS();
              }
          } else { // W3c浏览器
              style.appendChild(document.createTextNode(cssStyle));
              theHead.appendChild(style);
          }
      }
  }
  createStyle(){
      var style = `
      \n.custom-progress-container{
          position: absolute;
          bottom: 26px;
          left: 0;
          z-index: 10;
          height: 16px;
          width: 100%;
      }
      \n.custom-progress-container .custom-progress-content{
          position: relative;
          width: 100%;
          height: 2px;
      }
      \n.custom-progress-container .custom-progress-content .custom-progress-total{
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.35);
      }
      \n.custom-progress-container .custom-progress-content .custom-progress-loaded{
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 100%;
          background: rgba(255, 255, 255, 0.6);
      }
      \n.custom-progress-container .custom-progress-content .custom-progress-played{
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 100%;
          background: #F7321C;
      }
      \n.custom-progress-container .custom-progress-content .custom-progress-marker{
          position: absolute;
          left: 0;
          top: 50%;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FFFFFF;
          transform: translate(0,-50%);
      }
      \n.custom-progress-container .custom-progress-content .custom-progress-drag{
          position: absolute;
          left: 0;
          top: -8px;
          width: 100%;
          height: 16px;
      }
      
      \n.custom-progress-container:hover .custom-progress-marker{
          display: block;
      }
      `
      this.insertCSS(style)
  }
}

export {
  ProgressComponent
}

// \n.custom-progress-container:hover .custom-progress-content{
//   height: 5px;
// }