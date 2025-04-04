// 初始化画布
const canvas = new fabric.Canvas('main-canvas', {
    selectionColor: 'rgba(74, 144, 226, 0.3)',
    selectionBorderColor: '#4a90e2',
    selectionLineWidth: 2,
    backgroundColor: null,
    preserveObjectStacking: true,
    skipTargetFind: false,
    targetFindTolerance: 10,
    hoverCursor: 'move',
    moveCursor: 'move',
    allowTouchScrolling: false,
    fireMiddleClick: true,
    fireRightClick: true,
    stopContextMenu: true,
    controlsAboveOverlay: true
});

// 全局常量
const TARGET_SIZE = 1200; // 标准工作尺寸

let activeTool = 'select';
let isMobile = false;

// 检测设备类型
function detectDevice() {
    isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile-device', isMobile);
}

// 初始化画布大小
function initCanvasSize() {
    const wrapper = document.querySelector('.canvas-wrapper');
    const maxWidth = wrapper.clientWidth - (isMobile ? 20 : 40);
    const maxHeight = wrapper.clientHeight - (isMobile ? 20 : 40);
    
    let canvasWidth, canvasHeight;
    
    if (isMobile) {
        // 移动设备：优先考虑宽度，使画布适合屏幕
        canvasWidth = Math.min(maxWidth, TARGET_SIZE);
        canvasHeight = Math.round(canvasWidth * 0.75); // 4:3比例
        
        // 如果高度太大，再次调整
        if (canvasHeight > maxHeight * 0.8) {
            canvasHeight = maxHeight * 0.8;
            canvasWidth = Math.round(canvasHeight * 4 / 3);
        }
    } else {
        // 桌面设备：尝试使用TARGET_SIZE，但确保适合屏幕
        if (TARGET_SIZE <= maxWidth && (TARGET_SIZE * 0.75) <= maxHeight) {
            // 可以使用目标尺寸
            canvasWidth = TARGET_SIZE;
            canvasHeight = Math.round(TARGET_SIZE * 0.75); // 4:3比例
        } else {
            // 屏幕太小，需要缩小
            canvasWidth = Math.min(maxWidth, (maxHeight * 4) / 3);
            canvasHeight = (canvasWidth * 3) / 4;
        }
    }
    
    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    canvas.calcOffset();
    
    document.querySelector('.canvas-container').style.margin = isMobile ? '10px auto' : '20px auto';
    
    if (canvas.backgroundImage) {
        fitBackgroundImage();
    }
    
    canvas.renderAll();
}

// 调整背景图片适应画布
function fitBackgroundImage() {
    const bgImg = canvas.backgroundImage;
    if (!bgImg) return;
    
    // 获取画布尺寸
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // 设置图片大小完全匹配画布大小
    const scaleX = canvasWidth / bgImg.width;
    const scaleY = canvasHeight / bgImg.height;
    
    // 设置图片位置和比例，使其完全覆盖画布
    bgImg.set({
        scaleX: scaleX,
        scaleY: scaleY,
        left: 0,
        top: 0
    });
    
    canvas.requestRenderAll();
}

// 隐藏启动画面
function hideSplash() {
    const splash = document.getElementById('splash-screen');
    splash.style.opacity = '0';
    
    // 确保主界面元素在启动画面隐藏前是隐藏状态
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.main-container').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    
    // 直接显示开始界面，不初始化画布
    setTimeout(() => {
        splash.style.display = 'none';
        showStartScreen();
    }, 600);
}

// 显示/隐藏开始界面
function showStartScreen() {
    document.getElementById('start-screen').style.display = 'flex';
    
    // 移动端处理：隐藏底部导航栏
    if (isMobile) {
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) {
            mobileNav.style.display = 'none';
        }
        
        // 隐藏工具栏和面板
        const toolbar = document.querySelector('.toolbar');
        const propertiesPanel = document.getElementById('properties-content');
        const layersPanel = document.getElementById('layers-content');
        
        if (toolbar) {
            toolbar.style.display = 'none';
        }
        
        if (propertiesPanel && layersPanel) {
            propertiesPanel.classList.remove('active');
            layersPanel.classList.remove('active');
            propertiesPanel.style.transform = 'translateY(100%)';
            layersPanel.style.transform = 'translateY(100%)';
        }
    }
}

function hideStartScreen() {
    document.getElementById('start-screen').style.display = 'none';
}

// 显示/隐藏导出界面
function showExportScreen() {
    document.getElementById('export-screen').style.display = 'flex';
}

function hideExportScreen() {
    document.getElementById('export-screen').style.display = 'none';
}

// 开始编辑
function startEditing() {
    document.querySelector('.header').style.display = 'flex';
    document.querySelector('.main-container').style.display = 'flex';
    document.querySelector('.footer').style.display = 'flex';
    hideStartScreen();
    
    // 初始化画布大小
    initCanvasSize();
    
    // 如果是移动设备，确保工具栏正确显示，同时隐藏底部状态栏
    if (isMobile) {
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.style.display = 'none';
        }
        
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) {
            mobileNav.style.display = 'flex';
        }
        
        const toolbar = document.querySelector('.toolbar');
        if (toolbar) {
            toolbar.style.display = 'flex';
        }
        
        const propertiesPanel = document.getElementById('properties-content');
        const layersPanel = document.getElementById('layers-content');
        if (propertiesPanel && layersPanel) {
            // 确保属性和图层面板的初始状态是隐藏的
            propertiesPanel.classList.remove('active');
            layersPanel.classList.remove('active');
            
            // 强制设置样式，确保隐藏
            propertiesPanel.style.transform = 'translateY(100%)';
            layersPanel.style.transform = 'translateY(100%)';
        }
    }
}

// 页面加载
window.addEventListener('DOMContentLoaded', () => {
    // 立即检测设备类型
    detectDevice();
    
    // 确保主界面元素在初始时是隐藏状态
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.main-container').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    
    // 如果是移动设备，预先强制隐藏面板
    if (isMobile) {
        const propertiesPanel = document.getElementById('properties-content');
        const layersPanel = document.getElementById('layers-content');
        
        if (propertiesPanel && layersPanel) {
            // 立即强制添加内联样式，确保面板完全隐藏
            propertiesPanel.style.transform = 'translateY(100%)';
            layersPanel.style.transform = 'translateY(100%)';
            propertiesPanel.style.display = 'block';
            layersPanel.style.display = 'block';
            propertiesPanel.classList.remove('active');
            layersPanel.classList.remove('active');
        }
        
        // 确保移动端导航栏在初始状态下是隐藏的
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) {
            mobileNav.style.display = 'none';
        }
    }
    
    const progressBar = document.querySelector('.loading-progress');
    let progress = 0;
    
    const animateProgress = () => {
        progress += Math.random() * 15;
        if(progress >= 100) {
            progressBar.style.width = '100%';
            setTimeout(hideSplash, 400);
            return;
        }
        progressBar.style.width = progress + '%';
        requestAnimationFrame(animateProgress);
    };
    
    setTimeout(() => {
        requestAnimationFrame(animateProgress);
    }, 800);
    
    // 设置触摸事件
    setupTouchEvents();
    // 设置移动UI
    setupMobileUI();
});

// 设置移动端UI
function setupMobileUI() {
    if (!isMobile) return;
    
    // 隐藏移动导航栏，当用户开始编辑时才显示
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        mobileNav.style.display = 'none';
    }
    
    // 初始化面板结构
    initializeMobilePanels();
    
    // 设置移动端面板切换的事件处理
    const mobileNavButtons = document.querySelectorAll('.mobile-nav-button');
    mobileNavButtons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.backgroundColor = '#444';
        });
        
        button.addEventListener('touchend', function() {
            this.style.backgroundColor = '';
        });
    });
    
    // 为滑动面板添加触摸手势支持
    setupPanelTouchGestures();
    
    // 添加针对移动设备的其他初始化
    canvas.on('object:selected', function(e) {
        if (isMobile) {
            // 在移动设备上，选择对象自动显示属性面板
            toggleMobilePanel('properties-content');
        }
    });
}

// 设置面板的触摸手势
function setupPanelTouchGestures() {
    const propertiesPanel = document.getElementById('properties-content');
    const layersPanel = document.getElementById('layers-content');
    
    // 为面板添加滑动关闭手势
    [propertiesPanel, layersPanel].forEach(panel => {
        if (!panel) return;
        
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        // 触摸开始
        panel.addEventListener('touchstart', function(e) {
            // 只有当触摸发生在拖拽条上时才启用拖拽
            const dragHandle = panel.querySelector('.panel-drag-handle');
            const touch = e.touches[0];
            const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (targetElement === dragHandle || dragHandle.contains(targetElement)) {
                isDragging = true;
                startY = touch.clientY;
                panel.style.transition = 'none'; // 拖拽时禁用动画
            }
        });
        
        // 触摸移动
        panel.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            // 只允许向下拖拽
            if (deltaY > 0) {
                panel.style.transform = `translateY(${deltaY}px)`;
            }
        });
        
        // 触摸结束
        panel.addEventListener('touchend', function() {
            if (!isDragging) return;
            
            panel.style.transition = 'transform 0.3s ease'; // 恢复动画
            
            // 如果拖拽距离超过面板高度的30%，则关闭面板
            if ((currentY - startY) > panel.offsetHeight * 0.3) {
                toggleMobilePanel('toolbar');
            } else {
                // 否则恢复到原始位置
                panel.style.transform = 'translateY(0)';
            }
            
            isDragging = false;
        });
    });
}

// 初始化移动端面板结构
function initializeMobilePanels() {
    const propertiesPanel = document.getElementById('properties-content');
    const layersPanel = document.getElementById('layers-content');
    
    // 确保面板没有活动类
    propertiesPanel.classList.remove('active');
    layersPanel.classList.remove('active');
    
    // 确保面板被正确定位在屏幕外
    propertiesPanel.style.transform = 'translateY(100%)';
    layersPanel.style.transform = 'translateY(100%)';
    
    // 为属性面板添加拖拽条和关闭按钮
    if (!propertiesPanel.querySelector('.panel-drag-handle')) {
        // 添加拖拽条
        const dragHandle = document.createElement('div');
        dragHandle.className = 'panel-drag-handle';
        propertiesPanel.insertBefore(dragHandle, propertiesPanel.firstChild);
        
        // 添加关闭按钮
        const closeBtn = document.createElement('div');
        closeBtn.className = 'panel-close';
        closeBtn.innerHTML = '✕';
        closeBtn.onclick = function() {
            toggleMobilePanel('toolbar');
        };
        propertiesPanel.insertBefore(closeBtn, propertiesPanel.firstChild);
    }
    
    // 为图层面板添加拖拽条和关闭按钮
    if (!layersPanel.querySelector('.panel-drag-handle')) {
        // 添加拖拽条
        const dragHandle = document.createElement('div');
        dragHandle.className = 'panel-drag-handle';
        layersPanel.insertBefore(dragHandle, layersPanel.firstChild);
        
        // 添加关闭按钮
        const closeBtn = document.createElement('div');
        closeBtn.className = 'panel-close';
        closeBtn.innerHTML = '✕';
        closeBtn.onclick = function() {
            toggleMobilePanel('toolbar');
        };
        layersPanel.insertBefore(closeBtn, layersPanel.firstChild);
    }
}

// 窗口大小改变时调整画布
window.addEventListener('resize', () => {
    detectDevice();
    initCanvasSize();
});

// 移动端触摸事件优化
function setupTouchEvents() {
    // 防止在画布上滚动时导致整个页面滚动
    const canvasContainer = document.querySelector('.canvas-container');
    canvasContainer.addEventListener('touchmove', function(e) {
        if (e.target === canvas.upperCanvasEl || e.target.closest('.canvas-container')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // 使控件在移动设备上更容易点击
    if (isMobile) {
        // 增大控制点大小
        fabric.Object.prototype.cornerSize = 24;
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#4a90e2';
        fabric.Object.prototype.borderColor = '#4a90e2';
        fabric.Object.prototype.borderScaleFactor = 2;
        
        // 双击缩放处理
        let lastTapTime = 0;
        let initialPinchDistance = 0;
        let isZooming = false;
        
        canvasContainer.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                // 保存初始捏合距离
                isZooming = true;
                initialPinchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            } else if (e.touches.length === 1) {
                // 检测双击
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTapTime;
                if (tapLength < 300 && tapLength > 0) {
                    // 双击重置画布
                    if (!canvas.getActiveObject()) {
                        e.preventDefault();
                        canvas.setZoom(1);
                        canvas.viewportCenterObject(canvas);
                        canvas.requestRenderAll();
                    }
                }
                lastTapTime = currentTime;
            }
        });
        
        canvasContainer.addEventListener('touchmove', function(e) {
            if (isZooming && e.touches.length === 2) {
                e.preventDefault();
                
                // 计算新的捏合距离
                const currentPinchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                
                // 计算缩放比例
                const scaleFactor = currentPinchDistance / initialPinchDistance;
                
                // 计算捏合中心点
                const center = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                };
                
                // 限制最大最小缩放级别
                const newZoom = Math.max(0.5, Math.min(5, canvas.getZoom() * scaleFactor));
                
                // 相对于捏合中心点缩放
                canvas.zoomToPoint(new fabric.Point(center.x, center.y), newZoom);
                
                // 更新初始距离
                initialPinchDistance = currentPinchDistance;
            }
        });
        
        canvasContainer.addEventListener('touchend', function() {
            isZooming = false;
        });
    }
}

// 屏幕方向变化处理
window.addEventListener('orientationchange', function() {
    // 延迟执行以等待浏览器完成旋转
    setTimeout(() => {
        detectDevice();
        initCanvasSize();
        
        // 如果是移动设备，初始时隐藏工具和面板
        if (isMobile) {
            // 显示工具栏，隐藏其他面板
            toggleMobilePanel('toolbar');
        }
    }, 300);
});

// 设置当前工具（修改触摸事件处理）
function setActiveTool(tool) {
    activeTool = tool;
    
    document.querySelectorAll('.tool-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 修复事件对象可能不存在的问题
    const targetButton = document.querySelector(`.tool-button[data-tool="${tool}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    switch(tool) {
        case 'select':
            canvas.isDrawingMode = false;
            canvas.selection = true;
            break;
        case 'text':
            canvas.isDrawingMode = false;
            canvas.selection = true;
            // 在移动设备上自动显示属性面板
            if (isMobile) {
                toggleMobilePanel('properties-content');
                document.getElementById('text-properties').scrollIntoView({ behavior: 'smooth' });
            }
            break;
        case 'rect':
        case 'circle':
        case 'triangle':
            canvas.isDrawingMode = false;
            canvas.selection = true;
            // 在移动设备上自动显示属性面板
            if (isMobile) {
                toggleMobilePanel('properties-content');
                document.getElementById('shape-properties').scrollIntoView({ behavior: 'smooth' });
            }
            break;
        default:
            canvas.isDrawingMode = false;
            canvas.selection = true;
    }
}

// 切换属性面板和图层面板
function switchPanel(panel) {
    // 更新标签状态
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 找到对应的标签并激活
    const targetTab = document.querySelector(`.panel-tab[data-panel="${panel}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 获取面板元素
    const propertiesContent = document.getElementById('properties-content');
    const layersContent = document.getElementById('layers-content');
    
    // 确保面板元素存在
    if (!propertiesContent || !layersContent) return;
    
    // 根据设备类型处理面板切换
    if (isMobile) {
        // 移动端处理 - 通过toggleMobilePanel函数处理
        toggleMobilePanel(panel === 'properties' ? 'properties-content' : 'layers-content');
    } else {
        // 桌面端处理 - 直接控制display属性
        propertiesContent.style.display = panel === 'properties' ? 'block' : 'none';
        layersContent.style.display = panel === 'layers' ? 'block' : 'none';
    }
    
    // 如果是图层面板，更新图层列表
    if (panel === 'layers') {
        updateLayersPanel();
    }
}

// 更新图层面板
function updateLayersPanel() {
    const layersList = document.getElementById('layers-list');
    layersList.innerHTML = '';
    
    // 如果有背景图片，添加到图层列表顶部
    if (canvas.backgroundImage) {
        const bgLayer = document.createElement('div');
        bgLayer.className = 'layer-item';
        bgLayer.innerHTML = `
            <div class="layer-thumbnail">BG</div>
            <div class="layer-name">背景图片</div>
            <div class="layer-visibility" onclick="toggleLayerVisibility(this, 'background')">${canvas.backgroundImage.visible ? '👁️' : '🚫'}</div>
        `;
        layersList.appendChild(bgLayer);
    }
    
    // 添加所有对象到图层列表
    const objects = canvas.getObjects();
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item ${obj === canvas.getActiveObject() ? 'active' : ''} ${obj.visible ? '' : 'hidden'}`;
        layerItem.dataset.index = i;
        layerItem.onclick = function() {
            selectLayer(i);
        };
        
        let typeIcon = '';
        let typeName = '';
        
        switch(obj.type) {
            case 'i-text':
                typeIcon = 'T';
                typeName = '文字: ' + (obj.text.length > 10 ? obj.text.substring(0, 10) + '...' : obj.text);
                break;
            case 'rect':
                typeIcon = '□';
                typeName = '矩形';
                break;
            case 'circle':
                typeIcon = '○';
                typeName = '圆形';
                break;
            case 'triangle':
                typeIcon = '△';
                typeName = '三角形';
                break;
            case 'image':
                typeIcon = '🖼️';
                typeName = '图片';
                break;
            default:
                typeIcon = '?';
                typeName = '未知对象';
        }
        
        layerItem.innerHTML = `
            <div class="layer-thumbnail">${typeIcon}</div>
            <div class="layer-name">${typeName}</div>
            <div class="layer-visibility" onclick="toggleLayerVisibility(this, ${i})">${obj.visible ? '👁️' : '🚫'}</div>
        `;
        
        layersList.appendChild(layerItem);
    }
}

// 选择图层
function selectLayer(index) {
    const obj = canvas.getObjects()[index];
    if (obj) {
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
        updatePropertiesPanel();
        updateLayersPanel();
        
        // 切换到属性面板，区分移动端和桌面端
        if (isMobile) {
            toggleMobilePanel('properties-content');
        } else {
            document.querySelectorAll('.panel-tab').forEach(tab => {
                tab.classList.toggle('active', tab.getAttribute('data-panel') === 'properties');
            });
            document.getElementById('properties-content').style.display = 'block';
            document.getElementById('layers-content').style.display = 'none';
        }
    }
}

// 切换图层可见性
function toggleLayerVisibility(element, index) {
    if (index === 'background') {
        // 背景图片可见性
        const bgImg = canvas.backgroundImage;
        if (bgImg) {
            bgImg.set('visible', !bgImg.visible);
            element.innerHTML = bgImg.visible ? '👁️' : '🚫';
            element.parentElement.classList.toggle('hidden', !bgImg.visible);
            canvas.requestRenderAll();
        }
    } else {
        // 普通对象可见性
        const obj = canvas.getObjects()[index];
        if (obj) {
            obj.set('visible', !obj.visible);
            element.innerHTML = obj.visible ? '👁️' : '🚫';
            element.parentElement.classList.toggle('hidden', !obj.visible);
            canvas.requestRenderAll();
        }
    }
    
    // 阻止事件冒泡，避免触发图层选择
    event.stopPropagation();
}

// 上移图层
function moveLayerUp() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    
    canvas.bringForward(activeObj);
    canvas.requestRenderAll();
    updateLayersPanel();
}

// 下移图层
function moveLayerDown() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    
    canvas.sendBackwards(activeObj);
    canvas.requestRenderAll();
    updateLayersPanel();
}

// 删除选中图层
function deleteSelectedLayer() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    
    canvas.remove(activeObj);
    canvas.requestRenderAll();
    updateLayersPanel();
}

// 设置背景图片
document.getElementById('set-background-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const imgObj = new Image();
        imgObj.src = event.target.result;
        
        imgObj.onload = function() {
            // 保存原始尺寸数据
            const originalWidth = imgObj.width;
            const originalHeight = imgObj.height;
            
            // 获取编辑界面尺寸
            const wrapper = document.querySelector('.canvas-wrapper');
            const editorWidth = wrapper.clientWidth - (isMobile ? 20 : 40);
            const editorHeight = wrapper.clientHeight - (isMobile ? 20 : 40);
            
            // 计算编辑界面的75%尺寸
            const targetWidth = editorWidth * 0.75;
            const targetHeight = editorHeight * 0.75;
            
            // 计算适当缩放比例，确保图片完全适应目标尺寸
            let scale, imgWidth, imgHeight;
            
            // 根据图片比例和目标区域比例计算
            const imgRatio = originalWidth / originalHeight;
            const targetRatio = targetWidth / targetHeight;
            
            if (imgRatio >= targetRatio) {
                // 图片较宽，以宽度为准
                imgWidth = targetWidth;
                scale = targetWidth / originalWidth;
                imgHeight = originalHeight * scale;
            } else {
                // 图片较高，以高度为准
                imgHeight = targetHeight;
                scale = targetHeight / originalHeight;
                imgWidth = originalWidth * scale;
            }
            
            // 四舍五入到整数像素
            imgWidth = Math.round(imgWidth);
            imgHeight = Math.round(imgHeight);
            
            // 显示尺寸变化信息
            if (Math.abs(scale - 1) > 0.01) { // 如果缩放比例不接近1
                if (scale < 1) {
                    showToast(`图片尺寸(${originalWidth}x${originalHeight})已缩小至编辑界面75%(${imgWidth}x${imgHeight}像素)，导出时将使用原始尺寸`);
                } else {
                    showToast(`图片尺寸(${originalWidth}x${originalHeight})已放大至编辑界面75%(${imgWidth}x${imgHeight}像素)，导出时将使用原始尺寸`);
                }
            } else {
                showToast(`图片尺寸为${imgWidth}x${imgHeight}像素（编辑界面的75%）`);
            }
            
            // 设置画布尺寸为调整后的图片尺寸
            canvas.setWidth(imgWidth);
            canvas.setHeight(imgHeight);
            
            fabric.Image.fromURL(event.target.result, function(img) {
                // 保存原始图片数据用于导出
                img.originalSrc = event.target.result;
                img.originalWidth = originalWidth;
                img.originalHeight = originalHeight;
                
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: scale,
                    scaleY: scale,
                    left: 0,
                    top: 0
                });
                
                canvas.requestRenderAll();
                // 更新属性面板
                updatePropertiesPanel();
                updateLayersPanel();
            }, { crossOrigin: 'anonymous' });
        };
    };
    reader.readAsDataURL(file);
});

// 插入图片处理
document.getElementById('insert-image-input').addEventListener('change', function(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // 检查是否已导入背景图片
    if (!canvas.backgroundImage) {
        showToast('请先导入背景图片再插入其他图片');
        return;
    }
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            fabric.Image.fromURL(event.target.result, function(img) {
                // 计算图片适当尺寸 - 确保图片不会超过画布的50%
                const maxWidth = canvas.width * 0.5;
                const maxHeight = canvas.height * 0.5;
                
                // 计算适当的缩放比例
                let scale = 1;
                if (img.width > maxWidth || img.height > maxHeight) {
                    scale = Math.min(maxWidth / img.width, maxHeight / img.height);
                }
                
                // 使图片默认居中
                const centerX = canvas.width / 2 - (img.width * scale) / 2;
                const centerY = canvas.height / 2 - (img.height * scale) / 2;
                
                // 保存原始图片数据
                img.originalSrc = event.target.result;
                img.originalWidth = img.width;
                img.originalHeight = img.height;
                
                img.set({
                    left: centerX,
                    top: centerY,
                    scaleX: scale,
                    scaleY: scale,
                    hasControls: true,
                    hasBorders: true,
                    lockUniScaling: false,
                    borderColor: '#4a90e2',
                    cornerColor: '#4a90e2',
                    cornerSize: 10,
                    transparentCorners: false
                });
                
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.requestRenderAll();
                updatePropertiesPanel();
                updateLayersPanel();
            }, {
                crossOrigin: 'anonymous'
            });
        };
        reader.readAsDataURL(file);
    });
});

// 导入PED文件
document.getElementById('ped-input').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        // 先隐藏开始界面，显示编辑界面
        startEditing();
        
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const pedData = JSON.parse(event.target.result);
                
                canvas.clear();
                
                if (pedData.background) {
                    // 先加载背景图片
                    const backgroundImg = new Image();
                    backgroundImg.src = pedData.background;
                    
                    await new Promise((resolve) => {
                        backgroundImg.onload = function() {
                            // 获取原始尺寸
                            const originalWidth = pedData.backgroundImageOptions && pedData.backgroundImageOptions.originalWidth 
                                ? pedData.backgroundImageOptions.originalWidth 
                                : backgroundImg.width;
                            const originalHeight = pedData.backgroundImageOptions && pedData.backgroundImageOptions.originalHeight 
                                ? pedData.backgroundImageOptions.originalHeight 
                                : backgroundImg.height;
                            
                            // 获取编辑界面尺寸
                            const wrapper = document.querySelector('.canvas-wrapper');
                            const editorWidth = wrapper.clientWidth - (isMobile ? 20 : 40);
                            const editorHeight = wrapper.clientHeight - (isMobile ? 20 : 40);
                            
                            // 计算编辑界面的75%尺寸
                            const targetWidth = editorWidth * 0.75;
                            const targetHeight = editorHeight * 0.75;
                            
                            // 计算适当缩放比例
                            let scale, imgWidth, imgHeight;
                            
                            // 根据图片比例和目标区域比例计算
                            const imgRatio = originalWidth / originalHeight;
                            const targetRatio = targetWidth / targetHeight;
                            
                            if (imgRatio >= targetRatio) {
                                // 图片较宽，以宽度为准
                                imgWidth = targetWidth;
                                scale = targetWidth / originalWidth;
                                imgHeight = originalHeight * scale;
                            } else {
                                // 图片较高，以高度为准
                                imgHeight = targetHeight;
                                scale = targetHeight / originalHeight;
                                imgWidth = originalWidth * scale;
                            }
                            
                            // 四舍五入到整数像素
                            imgWidth = Math.round(imgWidth);
                            imgHeight = Math.round(imgHeight);
                            
                            // 设置画布大小
                            canvas.setWidth(imgWidth);
                            canvas.setHeight(imgHeight);
                            canvas.backgroundColor = pedData.backgroundColor || '#ffffff';
                            
                            // 加载背景图片
                            fabric.Image.fromURL(pedData.background, function(img) {
                                // 保存原始图片数据，用于高质量导出
                                if (pedData.backgroundImageOptions && 
                                    pedData.backgroundImageOptions.originalWidth) {
                                    img.originalWidth = pedData.backgroundImageOptions.originalWidth;
                                    img.originalHeight = pedData.backgroundImageOptions.originalHeight;
                                    img.originalSrc = pedData.background;
                                }
                                
                                // 设置背景图片属性
                                canvas.setBackgroundImage(img, () => {
                                    canvas.renderAll();
                                    resolve();
                                }, {
                                    scaleX: scale,
                                    scaleY: scale,
                                    left: 0,
                                    top: 0,
                                    crossOrigin: 'anonymous'
                                });
                            }, { crossOrigin: 'anonymous' });
                        };
                        
                        // 如果图片加载失败，也需要解决promise
                        backgroundImg.onerror = function() {
                            console.error('背景图片加载失败');
                            resolve();
                        };
                    });
                } else {
                    // 如果没有背景图片，使用PED中的尺寸
                    canvas.setWidth(pedData.width);
                    canvas.setHeight(pedData.height);
                    canvas.backgroundColor = pedData.backgroundColor || '#ffffff';
                }
                
                // 获取尺寸比例，用于调整其他对象
                const scaleRatio = canvas.width / pedData.width;
                
                // 加载其他对象
                for (const objData of pedData.objects) {
                    if (objData.type === 'image') {
                        // 调整图片对象位置和大小
                        const adjustedOptions = {...objData.options};
                        adjustedOptions.left *= scaleRatio;
                        adjustedOptions.top *= scaleRatio;
                        adjustedOptions.scaleX *= scaleRatio;
                        adjustedOptions.scaleY *= scaleRatio;
                        
                        await loadImageToCanvas(objData.data, adjustedOptions);
                    } else {
                        let obj;
                        // 复制选项并调整位置和大小
                        const adjustedOptions = {...objData.options};
                        adjustedOptions.left *= scaleRatio;
                        adjustedOptions.top *= scaleRatio;
                        if (adjustedOptions.scaleX) {
                            adjustedOptions.scaleX *= scaleRatio;
                            adjustedOptions.scaleY *= scaleRatio;
                        }
                        
                        switch(objData.type) {
                            case 'rect':
                                obj = new fabric.Rect(adjustedOptions);
                                break;
                            case 'circle':
                                obj = new fabric.Circle(adjustedOptions);
                                break;
                            case 'triangle':
                                obj = new fabric.Triangle(adjustedOptions);
                                break;
                            case 'i-text':
                                obj = new fabric.IText(adjustedOptions.text, adjustedOptions);
                                break;
                            default:
                                obj = fabric.util.enlivenObjects([adjustedOptions]);
                        }
                        canvas.add(obj);
                    }
                }
                
                canvas.renderAll();
                updateLayersPanel();
                
                // 如果有原始大小数据，显示提示
                if (pedData.backgroundImageOptions && 
                    pedData.backgroundImageOptions.originalWidth) {
                    showToast(`PED文件导入成功！原始图像分辨率为${pedData.backgroundImageOptions.originalWidth}x${pedData.backgroundImageOptions.originalHeight}，导出时将使用原始高质量图像。`);
                } else {
                    showToast('PED文件导入成功！');
                }
            } catch (error) {
                console.error('PED解析错误:', error);
                showToast('PED文件解析错误: ' + error.message);
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('PED导入失败:', error);
        showToast('PED导入失败: ' + error.message);
    }
});

// 加载图片到画布
async function loadImageToCanvas(imageData, options, isBackground = false) {
    return new Promise((resolve) => {
        fabric.Image.fromURL(imageData, function(img) {
            if (options) {
                img.set(options);
            }
            
            if (isBackground) {
                // 设置背景图片，使用原始尺寸
                canvas.setBackgroundImage(img, () => {
                    canvas.renderAll();
                    resolve();
                }, {
                    scaleX: 1,
                    scaleY: 1,
                    left: 0,
                    top: 0,
                    crossOrigin: 'anonymous'
                });
            } else {
                canvas.add(img);
                canvas.requestRenderAll();
                resolve();
            }
        }, {
            crossOrigin: 'anonymous'
        });
    });
}

// 添加文字
function addText() {
    const text = new fabric.IText(document.getElementById('text-content').value || '双击编辑文字', {
        left: 100,
        top: 100,
        fontFamily: document.getElementById('font-family').value,
        fill: document.getElementById('text-color').value,
        fontSize: parseInt(document.getElementById('font-size').value),
        hasControls: true,
        borderColor: '#4a90e2',
        cornerColor: '#4a90e2',
        cornerSize: 10,
        transparentCorners: false
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    updatePropertiesPanel();
    updateLayersPanel();
}

// 添加形状
function addShape() {
    const type = document.getElementById('shape-type').value;
    const width = parseInt(document.getElementById('shape-width').value);
    const height = parseInt(document.getElementById('shape-height').value);
    const fill = document.getElementById('shape-fill').value;

    let shape;
    switch(type) {
        case 'rect':
            shape = new fabric.Rect({
                width: width,
                height: height,
                fill: fill,
                left: 100,
                top: 100,
                hasControls: true,
                borderColor: '#4a90e2',
                cornerColor: '#4a90e2',
                cornerSize: 10,
                transparentCorners: false
            });
            break;
        case 'circle':
            shape = new fabric.Circle({
                radius: width / 2,
                fill: fill,
                left: 100,
                top: 100,
                hasControls: true,
                borderColor: '#4a90e2',
                cornerColor: '#4a90e2',
                cornerSize: 10,
                transparentCorners: false
            });
            break;
        case 'triangle':
            shape = new fabric.Triangle({
                width: width,
                height: height,
                fill: fill,
                left: 100,
                top: 100,
                hasControls: true,
                borderColor: '#4a90e2',
                cornerColor: '#4a90e2',
                cornerSize: 10,
                transparentCorners: false
            });
            break;
    }
    
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
    updatePropertiesPanel();
    updateLayersPanel();
}

// 更新属性面板
function updatePropertiesPanel() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    document.getElementById('pos-x').value = Math.round(activeObject.left);
    document.getElementById('pos-y').value = Math.round(activeObject.top);
    
    if (activeObject.width) {
        document.getElementById('width').value = Math.round(activeObject.width * activeObject.scaleX);
        document.getElementById('height').value = Math.round(activeObject.height * activeObject.scaleY);
    }
    
    if (activeObject.angle) {
        document.getElementById('rotation').value = Math.round(activeObject.angle);
    }
    
    if (activeObject.opacity !== undefined) {
        document.getElementById('opacity').value = activeObject.opacity;
    }
    
    // 更新颜色属性
    if (activeObject.fill && typeof activeObject.fill === 'string' && document.getElementById('object-color')) {
        document.getElementById('object-color').value = activeObject.fill;
    }
}

// 更新选中对象属性
function updateSelectedObject() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    activeObject.set({
        left: parseInt(document.getElementById('pos-x').value),
        top: parseInt(document.getElementById('pos-y').value),
        opacity: parseFloat(document.getElementById('opacity').value)
    });
    
    if (activeObject.angle !== undefined) {
        activeObject.set('angle', parseInt(document.getElementById('rotation').value));
    }
    
    if (activeObject.width) {
        const newWidth = parseInt(document.getElementById('width').value);
        const newHeight = parseInt(document.getElementById('height').value);
        
        activeObject.set({
            scaleX: newWidth / activeObject.width,
            scaleY: newHeight / activeObject.height
        });
    }
    
    // 更新对象颜色
    if (document.getElementById('object-color') && activeObject.fill !== undefined) {
        activeObject.set('fill', document.getElementById('object-color').value);
    }
    
    canvas.requestRenderAll();
    updateLayersPanel();
}

// 导出为PED文件
async function exportToPED() {
    try {
        if (!canvas.backgroundImage) {
            showToast('请先设置背景图片后再导出PED文件');
            return false;
        }
        
        const canvasState = {
            version: '1.0',
            background: canvas.backgroundImage ? (canvas.backgroundImage.originalSrc || await getImageData(canvas.backgroundImage)) : null,
            objects: [],
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor,
            backgroundImageOptions: canvas.backgroundImage ? {
                scaleX: canvas.backgroundImage.scaleX,
                scaleY: canvas.backgroundImage.scaleY,
                left: canvas.backgroundImage.left,
                top: canvas.backgroundImage.top,
                originalWidth: canvas.backgroundImage.originalWidth || canvas.width,
                originalHeight: canvas.backgroundImage.originalHeight || canvas.height
            } : null
        };

        // 如果背景图片有原始尺寸，添加提示信息
        if (canvas.backgroundImage && canvas.backgroundImage.originalWidth) {
            showToast(`PED文件将保存原始高分辨率(${canvas.backgroundImage.originalWidth}x${canvas.backgroundImage.originalHeight})数据`);
        }

        const objects = canvas.getObjects();
        for (const obj of objects) {
            if (obj.type === 'image') {
                canvasState.objects.push({
                    type: 'image',
                    data: await getImageData(obj),
                    options: {
                        left: obj.left,
                        top: obj.top,
                        scaleX: obj.scaleX,
                        scaleY: obj.scaleY,
                        angle: obj.angle,
                        opacity: obj.opacity
                    }
                });
            } else {
                canvasState.objects.push({
                    type: obj.type,
                    options: obj.toObject()
                });
            }
        }

        const blob = new Blob([JSON.stringify(canvasState)], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `design.ped`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);

        return true;
    } catch (error) {
        console.error('PED导出失败:', error);
        showToast('PED导出失败: ' + error.message);
        return false;
    }
}

// 获取图片数据
function getImageData(imageObject) {
    return new Promise((resolve) => {
        // 如果存在originalSrc（背景图片），使用它获取原始高质量数据
        if (imageObject.originalSrc) {
            resolve(imageObject.originalSrc);
        } else if (imageObject._originalElement) {
            const canvas = document.createElement('canvas');
            canvas.width = imageObject.width;
            canvas.height = imageObject.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageObject._originalElement, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        } else if (imageObject.toDataURL) {
            resolve(imageObject.toDataURL('image/png'));
        } else {
            resolve(null);
        }
    });
}

// 导出图片
async function exportImage() {
    const format = document.getElementById('export-format').value;
    
    if (format === 'ped') {
        const success = await exportToPED();
        if (success) {
            hideExportScreen();
        }
        return;
    }
    
    try {
        const bgImg = canvas.backgroundImage;
        if (!bgImg) {
            showToast('请先设置背景图片后再导出');
            return;
        }
        
        // 使用临时画布创建导出图像
        let exportWidth = canvas.width;
        let exportHeight = canvas.height;
        
        // 如果背景图片有原始尺寸数据，使用原始尺寸
        if (bgImg.originalWidth) {
            exportWidth = bgImg.originalWidth;
            exportHeight = bgImg.originalHeight;
            showToast(`正在以原始高分辨率(${exportWidth}x${exportHeight})导出，请稍候...`);
        }
        
        const tempCanvas = new fabric.StaticCanvas(null, {
            width: exportWidth,
            height: exportHeight
        });

        // 获取并复制所有对象
        const objects = canvas.getObjects();
        const clonePromises = objects.map(obj => 
            new Promise(resolve => {
                obj.clone(resolve);
            })
        );

        const clonedObjects = await Promise.all(clonePromises);
        
        // 设置背景图片（使用原始图像）
        if (bgImg.originalSrc) {
            await new Promise((resolve) => {
                fabric.Image.fromURL(bgImg.originalSrc, function(img) {
                    // 设置原始大小
                    tempCanvas.setBackgroundImage(img, tempCanvas.renderAll.bind(tempCanvas), {
                        scaleX: 1,
                        scaleY: 1,
                        left: 0,
                        top: 0
                    });
                    resolve();
                }, { crossOrigin: 'anonymous' });
            });
        } else {
            // 没有原始数据时，尝试使用现有背景图片
            const bgSrc = await getImageData(bgImg);
            await new Promise((resolve) => {
                fabric.Image.fromURL(bgSrc, function(img) {
                    // 计算适当的缩放比例
                    const scaleX = exportWidth / img.width;
                    const scaleY = exportHeight / img.height;
                    
                    tempCanvas.setBackgroundImage(img, tempCanvas.renderAll.bind(tempCanvas), {
                        scaleX: scaleX,
                        scaleY: scaleY,
                        left: 0,
                        top: 0
                    });
                    resolve();
                }, { crossOrigin: 'anonymous' });
            });
        }

        // 添加所有对象，调整它们的比例以适应导出尺寸
        const scaleRatio = exportWidth / canvas.width;
        clonedObjects.forEach(obj => {
            obj.set({
                scaleX: obj.scaleX * scaleRatio,
                scaleY: obj.scaleY * scaleRatio,
                left: obj.left * scaleRatio,
                top: obj.top * scaleRatio
            });
            tempCanvas.add(obj);
        });
        
        tempCanvas.renderAll();

        setTimeout(() => {
            const dataURL = tempCanvas.toDataURL({
                format: format === 'jpg' ? 'jpeg' : 'png',
                quality: 1.0,
                multiplier: 1
            });

            const link = document.createElement('a');
            link.download = `design.${format}`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            tempCanvas.dispose();
            hideExportScreen();
            showToast('导出完成! 图像已保存为原始高质量分辨率。');
        }, 500);
    } catch(error) {
        console.error('导出失败:', error);
        showToast('导出失败: ' + error.message);
    }
}

// 画布事件监听
canvas.on('selection:created', function() {
    updatePropertiesPanel();
    updateLayersPanel();
});

canvas.on('selection:updated', function() {
    updatePropertiesPanel();
    updateLayersPanel();
});

canvas.on('selection:cleared', function() {
    updateLayersPanel();
});

// 移动端面板切换
function toggleMobilePanel(panelId) {
    if (!isMobile) return;
    
    // 获取面板元素
    const propertiesPanel = document.getElementById('properties-content');
    const layersPanel = document.getElementById('layers-content');
    const toolbar = document.querySelector('.toolbar');
    
    // 确保面板已经初始化了拖拽条和关闭按钮
    if (!propertiesPanel.querySelector('.panel-drag-handle') || 
        !layersPanel.querySelector('.panel-drag-handle')) {
        initializeMobilePanels();
    }
    
    // 如果是工具栏，隐藏所有面板
    if (panelId === 'toolbar') {
        // 隐藏其他面板
        propertiesPanel.classList.remove('active');
        layersPanel.classList.remove('active');
        
        // 强制设置样式，确保隐藏
        propertiesPanel.style.transform = 'translateY(100%)';
        layersPanel.style.transform = 'translateY(100%)';
        
        // 显示工具栏
        toolbar.style.display = 'flex';
        return;
    }
    
    // 隐藏工具栏
    toolbar.style.display = 'none';
    
    // 处理属性面板
    if (panelId === 'properties-content') {
        // 更新顶部面板标签状态
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-panel') === 'properties');
        });
        
        // 切换面板显示
        propertiesPanel.classList.add('active');
        propertiesPanel.style.transform = 'translateY(0)';
        
        // 隐藏图层面板
        layersPanel.classList.remove('active');
        layersPanel.style.transform = 'translateY(100%)';
    } 
    // 处理图层面板
    else if (panelId === 'layers-content') {
        // 更新顶部面板标签状态
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-panel') === 'layers');
        });
        
        // 切换面板显示
        layersPanel.classList.add('active');
        layersPanel.style.transform = 'translateY(0)';
        
        // 隐藏属性面板
        propertiesPanel.classList.remove('active');
        propertiesPanel.style.transform = 'translateY(100%)';
        
        // 更新图层列表
        updateLayersPanel();
    }
}

// 显示提示消息
function showToast(message) {
    // 创建或获取toast元素
    let toast = document.getElementById('toast-message');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(60, 60, 60, 0.9)';
        toast.style.color = 'white';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '9999';
        toast.style.transition = 'opacity 0.3s';
        document.body.appendChild(toast);
    }
    
    // 显示消息
    toast.textContent = message;
    toast.style.opacity = '1';
    
    // 3秒后隐藏
    setTimeout(function() {
        toast.style.opacity = '0';
    }, 3000);
}

// 顶部首页按钮点击处理
function onHomeButtonClick() {
    showStartScreen();
}

// 初始化画布大小
initCanvasSize();
