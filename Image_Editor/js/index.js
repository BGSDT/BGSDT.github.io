let canvas = new fabric.Canvas('main-canvas', {
    selectionColor: 'rgba(74, 144, 226, 0.3)',
    selectionBorderColor: '#4a90e2',
    selectionLineWidth: 2
});

// 界面切换
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 图片导入（添加缩放功能）
document.getElementById('image-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        fabric.Image.fromURL(event.target.result, function (img) {
            // 保存原始尺寸
            img.set({
                originalWidth: img.width,
                originalHeight: img.height
            });

            // 计算缩放比例
            const maxWidth = canvas.getWidth();
            const maxHeight = canvas.getHeight();
            const scale = Math.min(
                maxWidth / img.width,
                maxHeight / img.height
            );

            // 设置缩放后的尺寸
            img.set({
                scaleX: scale,
                scaleY: scale,
                left: (maxWidth - img.width * scale) / 2,
                top: (maxHeight - img.height * scale) / 2
            });

            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            canvas.requestRenderAll();
        });
    };
    reader.readAsDataURL(file);
});

// 修改文字添加功能（移除阴影）
function addText() {
    const text = new fabric.IText(document.getElementById('text-input').value, {
        left: 100,
        top: 100,
        fontFamily: document.getElementById('font-select').value,
        fill: document.getElementById('text-color').value,
        fontSize: 24
    });
    canvas.add(text);
    canvas.setActiveObject(text);
}

// 添加形状（保持不变）
function addShape() {
    const type = document.getElementById('shape-select').value;
    const width = parseInt(document.getElementById('shape-width').value);
    const height = parseInt(document.getElementById('shape-height').value);
    const color = document.getElementById('shape-color').value;

    let shape;
    switch (type) {
        case 'rect':
            shape = new fabric.Rect({
                width: width,
                height: height,
                fill: color,
                left: 100,
                top: 100,
            });
            break;
        case 'circle':
            shape = new fabric.Circle({
                radius: width / 2,
                fill: color,
                left: 100,
                top: 100,
            });
            break;
        case 'triangle':
            shape = new fabric.Triangle({
                width: width,
                height: height,
                fill: color,
                left: 100,
                top: 100,
            });
            break;
    }
    canvas.add(shape);
    canvas.setActiveObject(shape);
}

// 修复导出功能
async function exportImage() {
    try {
        const format = document.getElementById('format-select').value;
        const bgImg = canvas.backgroundImage;

        if (!bgImg) {
            alert('请先上传图片');
            return;
        }

        // 创建临时画布
        const tempCanvas = new fabric.StaticCanvas(null, {
            width: bgImg.originalWidth,
            height: bgImg.originalHeight
        });

        // 克隆背景图片
        const bgClone = await new Promise(resolve => bgImg.clone(resolve));
        bgClone.set({
            scaleX: 1,
            scaleY: 1,
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top'
        });

        // 添加背景到临时画布
        tempCanvas.setBackgroundImage(bgClone, () => {
            // 处理所有对象
            const objects = canvas.getObjects();
            const scaleX = bgImg.originalWidth / (bgImg.width * bgImg.scaleX);
            const scaleY = bgImg.originalHeight / (bgImg.height * bgImg.scaleY);

            // 创建克隆Promise数组
            const clonePromises = objects.map(obj =>
                new Promise(resolve => {
                    obj.clone(cloned => {
                        // 修正坐标和缩放
                        cloned.set({
                            left: (cloned.left - bgImg.left) * scaleX,
                            top: (cloned.top - bgImg.top) * scaleY,
                            scaleX: cloned.scaleX * scaleX,
                            scaleY: cloned.scaleY * scaleY
                        });
                        resolve(cloned);
                    });
                })
            );

            // 等待所有对象克隆完成
            Promise.all(clonePromises).then(clonedObjects => {
                // 按原始z-index顺序添加对象
                clonedObjects.forEach(obj => tempCanvas.add(obj));
                tempCanvas.renderAll();

                // 添加渲染完成的延时
                setTimeout(() => {
                    const dataURL = tempCanvas.toDataURL({
                        format: format,
                        quality: 0.9,
                        multiplier: 1
                    });

                    // 创建下载链接
                    const link = document.createElement('a');
                    link.download = `design.${format}`;
                    link.href = dataURL;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    tempCanvas.dispose();
                }, 500);
            });
        });
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败: ' + error.message);
    }
}
// 新增模板初始化代码
const templates = [
    './image/pids.png',
    'https://via.placeholder.com/800x600/50e3c2/ffffff?text=模板2',
    'https://via.placeholder.com/800x600/ff6b6b/ffffff?text=模板3'
];

function initTemplates() {
    const gallery = document.querySelector('.template-gallery');
    templates.forEach(url => {
        const img = document.createElement('img');
        img.className = 'template-item';
        img.src = url.replace('800x600', '200x150'); // 使用缩略图
        img.onclick = () => loadTemplate(url);
        gallery.appendChild(img);
    });
}

// 新增模板加载函数
function loadTemplate(url) {
    fabric.Image.fromURL(url, function (img) {
        // 设置原始尺寸
        img.set({
            originalWidth: img.width,
            originalHeight: img.height
        });

        // 计算缩放比例
        const maxWidth = canvas.getWidth();
        const maxHeight = canvas.getHeight();
        const scale = Math.min(
            maxWidth / img.width,
            maxHeight / img.height
        );

        img.set({
            scaleX: scale,
            scaleY: scale,
            left: (maxWidth - img.width * scale) / 2,
            top: (maxHeight - img.height * scale) / 2
        });

        canvas.setBackgroundImage(img, () => {
            canvas.requestRenderAll();
            showScreen('edit-screen');
        });
    });
}

// 初始化模板库
window.onload = function () {
    initTemplates();
};
// 新增教程数据
const tutorials = [
    {
        title: "基础入门教程",
        thumbnail: "./image/pids.png",
        url: ""
    },
    {
        title: "高级特效教学",
        thumbnail: "./image/pids.png",
        url: "https://example.com/tutorial2"
    },
    {
        title: "导出技巧指南",
        thumbnail: "./image/pids.png",
        url: "https://example.com/tutorial3"
    }
];

// 初始化教程库
function initTutorials() {
    const gallery = document.querySelector('.tutorial-gallery');
    tutorials.forEach(tutorial => {
        const card = document.createElement('div');
        card.className = 'tutorial-card';

        const link = document.createElement('a');
        link.className = 'tutorial-link';
        link.href = tutorial.url;
        link.target = '_blank'; // 在新标签页打开

        const img = document.createElement('img');
        img.className = 'tutorial-thumbnail';
        img.src = tutorial.thumbnail.replace('300x200', '180x120');
        img.alt = tutorial.title;

        const title = document.createElement('div');
        title.className = 'tutorial-title';
        title.textContent = tutorial.title;

        link.appendChild(img);
        link.appendChild(title);
        card.appendChild(link);
        gallery.appendChild(card);
    });
}

// 初始化函数
window.onload = function () {
    initTemplates();
    initTutorials(); // 新增初始化教程
};
// 初始化画布
canvas.setWidth(1000);
canvas.setHeight(700);
