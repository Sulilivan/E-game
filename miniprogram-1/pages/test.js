// pages/test.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        levels: [0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0],
        // 对应每个梯度的 E 字高度（单位 px，举例，实际可按比例调整）
        eSizes: [146, 122, 97, 73, 59, 49, 37, 29, 24, 18, 14, 12, 10, 7],
        currentLevelIndex: 0,
        currentLevel: 0.1,
        eChar: '上',
        rotateDeg: 270,
        timer: 0,
        timerId: null,
        testCount: 0,
        formattedTime: '00:00:00',
        touchStart: {x: 0, y: 0},
        eImgSize: 146 // 初始大小
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 获取屏幕宽度
        wx.getSystemInfo({
            success: res => {
                const screenWidth = res.windowWidth;
                // 图片宽度为屏幕宽度的2/3
                const baseWidth = screenWidth * 2 / 3;
                this.setData({
                    screenWidth: screenWidth,
                    baseImgWidth: baseWidth,
                    currentLevel: this.data.levels[this.data.currentLevelIndex],
                    eImgSize: baseWidth // 初始大小
                });
            }
        });
        this.startTimer();
        this.randomEChar();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

        this.stopTimer();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    /**
     * 开始计时
     */
    startTimer() {
        this.setData({ timer: 0 });
        this.updateFormattedTime(0);
        this.data.timerId = setInterval(() => {
            let t = this.data.timer + 1;
            this.setData({ timer: t });
            this.updateFormattedTime(t);
        }, 1000);
    },

    /**
     * 停止计时
     */
    stopTimer() {
        clearInterval(this.data.timerId);
    },

    /**
     * 更新格式化时间
     */
    updateFormattedTime(sec) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        const pad = n => n < 10 ? '0' + n : n;
        this.setData({
            formattedTime: `${pad(h)}:${pad(m)}:${pad(s)}`
        });
    },

    /**
     * 随机生成方向
     */
    randomEChar() {
        const directions = ['上', '下', '左', '右'];
        const degs = [270, 90, 180, 0]; // 初始图片向右
        const rand = Math.floor(Math.random() * 4);
        this.setData({
            eChar: directions[rand],
            rotateDeg: degs[rand]
        });
    },

    /**
     * 播放音效
     */
    playSound(type) {
        const audio = wx.createInnerAudioContext();
        if (type === 'right') {
            audio.src = '/audio/right.mp3';
        } else {
            audio.src = '/audio/wrong.mp3';
        }
        audio.play();
    },

    /**
     * 检查答案
     */
    checkAnswer(direction) {
        if (direction === this.data.eChar) {
            this.playSound('right');
            this.nextTest();
        } else {
            this.playSound('wrong');
            this.setData({ testCount: 0 });
            this.randomEChar();
        }
    },

    /**
     * 重启测试
     */
    onRestart() {
        this.setData({
            currentLevelIndex: 0,
            currentLevel: this.data.levels[0],
            testCount: 0,
            timer: 0,
            eImgSize: this.data.baseImgWidth // 重置为初始大小
        });
        this.updateFormattedTime(0);
        this.randomEChar();
        this.stopTimer();
        this.startTimer();
    },

    /**
     * 下一个测试
     */
    nextTest() {
        let count = this.data.testCount + 1;
        if (count >= 5) {
            let nextIndex = this.data.currentLevelIndex + 1;
            if (nextIndex < this.data.levels.length) {
                // 按比例缩放图片高度，宽度始终为baseImgWidth
                const scale = this.data.eSizes[nextIndex] / this.data.eSizes[0];
                this.setData({
                    currentLevelIndex: nextIndex,
                    currentLevel: this.data.levels[nextIndex],
                    testCount: 0,
                    eImgSize: this.data.baseImgWidth * scale // 只改变图片大小
                });
                this.randomEChar();
            } else {
                wx.showToast({ title: '测试完成', icon: 'success', duration: 1200 });
                this.stopTimer();
                setTimeout(() => {
                    wx.redirectTo({
                        url: '/pages/index/index'
                    });
                }, 1200);
            }
        } else {
            this.setData({ testCount: count });
            this.randomEChar();
        }
    },

    // 触屏滑动识别
    onTouchStart(e) {
        this.setData({
            touchStart: { x: e.touches[0].clientX, y: e.touches[0].clientY }
        });
    },
    onTouchEnd(e) {
        const start = this.data.touchStart;
        const end = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30) this.checkAnswer('右');
            else if (dx < -30) this.checkAnswer('左');
        } else {
            if (dy > 30) this.checkAnswer('下');
            else if (dy < -30) this.checkAnswer('上');
        }
    },

    // 键盘方向键输入（仅模拟器支持）
    onKeyDown(e) {
        switch (e.keyCode) {
            case 37: this.checkAnswer('左'); break; // 左
            case 38: this.checkAnswer('上'); break; // 上
            case 39: this.checkAnswer('右'); break; // 右
            case 40: this.checkAnswer('下'); break; // 下
        }
    },

    onUp() { this.checkAnswer('上'); },
    onDown() { this.checkAnswer('下'); },
    onLeft() { this.checkAnswer('左'); },
    onRight() { this.checkAnswer('右'); },

})