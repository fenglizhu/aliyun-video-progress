### 官方使用
附上[自定义组件地址](https://help.aliyun.com/document_detail/63207.html?spm=5176.21213303.J_6704733920.13.20983edayIdbTW&scm=20140722.S_help%40%40%E6%96%87%E6%A1%A3%40%4063207.S_os%2Bhot.ID_63207-RL_%E6%89%A9%E5%B1%95%E7%BB%84%E4%BB%B6-OR_helpmain-V_2-P0_1)

### 自定义好的组件该如何使用

```
 new Aliplayer({
    ...
    // 自定义进度条组件
    components:[
      { name: 'ProgressComponent', type: ProgressComponent },
    ],
  },function(player){});