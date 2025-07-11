// ==UserScript==
// @name         Video Frame Screenshot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  捕获在线视频的当前帧并保存为图片
// @author       BitX
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /**
     * 创建视频截图按钮
     */
    function createVideoScreenshotButton() {
        const btn = document.createElement('button');
        btn.innerHTML = '视频截图';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = '9999';
        btn.style.padding = '10px 15px';
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';

        btn.addEventListener('click', takeVideoScreenshot);
        document.body.appendChild(btn);
    }

    /**
     * 捕获视频当前帧并显示预览
     */
    function takeVideoScreenshot() {
        // 获取所有视频元素
        const videos = document.querySelectorAll('video');
        let video = null;
        // 如果只有一个视频元素，直接使用它
        if (videos.length === 1) {
            video = videos[0];
        } else {
            // 多个视频时，找到正在播放的那个
            for (const v of videos) {
                if (!v.paused) {
                    video = v;
                    break;
                }
            }
        }
        
        if (!video) {
            // 如果没有视频元素或没有正在播放的视频
            if (videos.length > 0) {
                alert(videos.length === 1 ? '请播放视频！' : '请先播放您想要截图的视频！');
            } else {
                alert('未检测到视频元素！');
            }
            return;
        }

        // 创建canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 显示预览对话框
        showPreviewDialog(canvas);
    }

    /**
     * 显示预览对话框
     * @param {HTMLCanvasElement} canvas 包含截图的canvas元素
     */
    function showPreviewDialog(canvas) {
        // 创建对话框容器
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '0';
        dialog.style.left = '0';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.backgroundColor = 'rgba(0,0,0,0.7)';
        dialog.style.zIndex = '10000';
        dialog.style.display = 'flex';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        
        // 创建关闭按钮
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(dialog);
        });
        dialog.appendChild(closeBtn);

        // 创建预览内容区域
        const content = document.createElement('div');
        content.style.backgroundColor = 'white';
        content.style.padding = '20px';
        content.style.borderRadius = '8px';
        content.style.maxWidth = '80%';
        content.style.maxHeight = '80%';
        content.style.overflow = 'auto';

        // 创建裁剪区域
        const cropContainer = document.createElement('div');
        cropContainer.style.position = 'relative';
        cropContainer.style.width = 'fit-content';
        cropContainer.style.margin = '0 auto';

        // 创建预览图片
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.style.maxWidth = '100%';
        img.style.maxHeight = '60vh';
        img.style.display = 'block';
        img.id = 'screenshot-img';

        // 创建裁剪框
        const cropBox = document.createElement('div');
        cropBox.style.position = 'absolute';
        cropBox.style.border = '2px dashed #4CAF50';
        cropBox.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
        cropBox.style.cursor = 'move';
        cropBox.style.display = 'none';
        cropBox.id = 'crop-box';

        // 创建文件名输入框
        const fileNameInput = document.createElement('input');
        fileNameInput.type = 'text';
        fileNameInput.value = `video_screenshot_${new Date().getTime()}.png`;
        fileNameInput.style.width = '100%';
        fileNameInput.style.margin = '10px 0';
        fileNameInput.style.padding = '8px';

        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';

        // 创建裁剪按钮
        const cropBtn = document.createElement('button');
        cropBtn.textContent = '裁剪';
        cropBtn.style.padding = '8px 16px';
        cropBtn.style.backgroundColor = '#2196F3';
        cropBtn.style.color = 'white';
        cropBtn.style.border = 'none';
        cropBtn.style.borderRadius = '4px';
        cropBtn.style.cursor = 'pointer';
        cropBtn.style.marginRight = '10px';

        // 创建保存裁剪按钮
        const saveCropBtn = document.createElement('button');
        saveCropBtn.textContent = '保存裁剪';
        saveCropBtn.style.padding = '8px 16px';
        saveCropBtn.style.backgroundColor = '#FF9800';
        saveCropBtn.style.color = 'white';
        saveCropBtn.style.border = 'none';
        saveCropBtn.style.borderRadius = '4px';
        saveCropBtn.style.cursor = 'pointer';
        saveCropBtn.style.display = 'none';
        saveCropBtn.id = 'save-crop-btn';

        // 组装裁剪区域
        cropContainer.appendChild(img);
        cropContainer.appendChild(cropBox);
        content.appendChild(cropContainer);

        // 创建下载按钮
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '下载原图';
        downloadBtn.style.padding = '8px 16px';
        downloadBtn.style.backgroundColor = '#4CAF50';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '4px';
        downloadBtn.style.cursor = 'pointer';

        // 创建取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.padding = '8px 16px';
        cancelBtn.style.backgroundColor = '#f44336';
        cancelBtn.style.color = 'white';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.cursor = 'pointer';

        // 下载按钮点击事件
        downloadBtn.addEventListener('click', function() {
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileNameInput.value;
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(dialog);
            }, 'image/png');
        });

        // 取消按钮点击事件
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(dialog);
        });

        // 组装对话框
        buttonContainer.appendChild(cropBtn);
        buttonContainer.appendChild(saveCropBtn);
        buttonContainer.appendChild(downloadBtn);
        buttonContainer.appendChild(cancelBtn);
        content.appendChild(document.createElement('p').appendChild(document.createTextNode('文件名:')).parentNode);
        content.appendChild(fileNameInput);
        content.appendChild(buttonContainer);
        dialog.appendChild(content);
        document.body.appendChild(dialog);

        // 裁剪功能实现
        let isCropping = false;
        let startX, startY, cropWidth, cropHeight;
        
        // 裁剪按钮点击事件
        cropBtn.addEventListener('click', function() {
            isCropping = true;
            cropBox.style.display = 'block';
            cropBox.style.width = '0';
            cropBox.style.height = '0';
            cropBox.style.left = '0';
            cropBox.style.top = '0';
            saveCropBtn.style.display = 'block';
            this.style.display = 'none';
            
            // 检查是否已存在预览区域，避免重复创建
            if (!previewContainer || !content.contains(previewContainer)) {
                previewContainer = document.createElement('div');
                previewContainer.style.marginTop = '10px';
                previewContainer.style.textAlign = 'center';
                
                previewLabel = document.createElement('p');
                previewLabel.textContent = '裁剪预览：';
                previewLabel.style.marginBottom = '5px';
                
                previewImg = document.createElement('img');
                previewImg.style.maxWidth = '200px';
                previewImg.style.maxHeight = '200px';
                previewImg.style.border = '1px solid #ddd';
                previewImg.style.display = 'none';
                
                previewContainer.appendChild(previewLabel);
                previewContainer.appendChild(previewImg);
                content.appendChild(previewContainer);
            } else {
                // 如果预览区域已存在但被隐藏，则显示出来
                previewContainer.style.display = 'block';
            }
            
            // 隐藏下载原图和取消按钮
            downloadBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            
            // 创建取消裁剪按钮
            const cancelCropBtn = document.createElement('button');
            cancelCropBtn.id = 'cancel-crop-btn';
            cancelCropBtn.textContent = '取消裁剪';
            cancelCropBtn.style.padding = '8px 16px';
            cancelCropBtn.style.backgroundColor = '#f44336';
            cancelCropBtn.style.color = 'white';
            cancelCropBtn.style.border = 'none';
            cancelCropBtn.style.borderRadius = '4px';
            cancelCropBtn.style.cursor = 'pointer';
            cancelCropBtn.style.marginLeft = '10px';
            
            // 取消裁剪按钮点击事件
            cancelCropBtn.addEventListener('click', function() {
                isCropping = false;
                cropBox.style.display = 'none';
                saveCropBtn.style.display = 'none';
                downloadBtn.style.display = 'block';
                cancelBtn.style.display = 'block';
                cropBtn.style.display = 'block';
                if (previewImg) previewImg.style.display = 'none';
                if (previewContainer) previewContainer.style.display = 'none';
                buttonContainer.removeChild(cancelCropBtn);
            });
            
            buttonContainer.insertBefore(cancelCropBtn, saveCropBtn.nextSibling);
        });

        // 预览区域将在裁剪时创建
        let previewContainer, previewLabel, previewImg;

        // 图片鼠标按下事件
        img.addEventListener('mousedown', function(e) {
            if (!isCropping && cropBox.style.display !== 'block') return;
            
            const rect = img.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // 检查是否点击在裁剪框内
            const cropBoxRect = cropBox.getBoundingClientRect();
            const isInsideCropBox = mouseX >= parseFloat(cropBox.style.left) && 
                                   mouseX <= parseFloat(cropBox.style.left) + parseFloat(cropBox.style.width) &&
                                   mouseY >= parseFloat(cropBox.style.top) && 
                                   mouseY <= parseFloat(cropBox.style.top) + parseFloat(cropBox.style.height);
            
            if (isInsideCropBox && cropBox.style.display === 'block' && cropBox.style.width !== '0px') {
                // 移动裁剪框
                const offsetX = mouseX - parseFloat(cropBox.style.left);
                const offsetY = mouseY - parseFloat(cropBox.style.top);
                
                function onMouseMove(e) {
                    const x = e.clientX - rect.left - offsetX;
                    const y = e.clientY - rect.top - offsetY;
                    
                    // 限制裁剪框不超出图片范围
                    const maxX = rect.width - parseFloat(cropBox.style.width);
                    const maxY = rect.height - parseFloat(cropBox.style.height);
                    
                    cropBox.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
                    cropBox.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
                    
                    // 确保裁剪框不会超出图片边界
                    if (parseFloat(cropBox.style.left) + parseFloat(cropBox.style.width) > rect.width) {
                        cropBox.style.left = (rect.width - parseFloat(cropBox.style.width)) + 'px';
                    }
                    if (parseFloat(cropBox.style.top) + parseFloat(cropBox.style.height) > rect.height) {
                        cropBox.style.top = (rect.height - parseFloat(cropBox.style.height)) + 'px';
                    }
                    
                    // 更新预览
                    updateCropPreview();
                }
                
                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            } else {
                // 创建新裁剪框
                startX = mouseX;
                startY = mouseY;
                
                cropBox.style.left = startX + 'px';
                cropBox.style.top = startY + 'px';
                cropBox.style.width = '0';
                cropBox.style.height = '0';
                
                function onMouseMove(e) {
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    cropWidth = x - startX;
                    cropHeight = y - startY;
                    
                    // 限制裁剪框大小不超过图片边界
                    const maxWidth = rect.width - parseFloat(cropBox.style.left);
                    const maxHeight = rect.height - parseFloat(cropBox.style.top);
                    
                    cropBox.style.width = Math.min(Math.abs(cropWidth), maxWidth) + 'px';
                    cropBox.style.height = Math.min(Math.abs(cropHeight), maxHeight) + 'px';
                    
                    if (cropWidth < 0) {
                        cropBox.style.left = Math.max(0, x) + 'px';
                    }
                    if (cropHeight < 0) {
                        cropBox.style.top = Math.max(0, y) + 'px';
                    }
                    
                    // 更新预览
                    updateCropPreview();
                }
                
                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        });
        
        // 更新裁剪预览
        function updateCropPreview() {
            if (Math.abs(cropWidth) > 10 && Math.abs(cropHeight) > 10) {
                const rect = img.getBoundingClientRect();
                const scaleX = img.naturalWidth / rect.width;
                const scaleY = img.naturalHeight / rect.height;
                
                const x = parseFloat(cropBox.style.left) * scaleX;
                const y = parseFloat(cropBox.style.top) * scaleY;
                const width = Math.abs(cropWidth) * scaleX;
                const height = Math.abs(cropHeight) * scaleY;
                
                const previewCanvas = document.createElement('canvas');
                previewCanvas.width = width;
                previewCanvas.height = height;
                const ctx = previewCanvas.getContext('2d');
                ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
                
                previewImg.src = previewCanvas.toDataURL('image/png');
                previewImg.style.display = 'block';
            } else {
                previewImg.style.display = 'none';
            }
        }
        
        // 保存裁剪按钮点击事件
        saveCropBtn.addEventListener('click', function() {
            if (!cropWidth || !cropHeight) {
                alert('请先选择裁剪区域！');
                return;
            }
            
            const rect = img.getBoundingClientRect();
            const cropCanvas = document.createElement('canvas');
            const ctx = cropCanvas.getContext('2d');
            
            // 计算实际裁剪坐标和尺寸
            const scaleX = img.naturalWidth / rect.width;
            const scaleY = img.naturalHeight / rect.height;
            
            const x = parseFloat(cropBox.style.left) * scaleX;
            const y = parseFloat(cropBox.style.top) * scaleY;
            const width = Math.abs(cropWidth) * scaleX;
            const height = Math.abs(cropHeight) * scaleY;
            
            // 设置裁剪画布尺寸
            cropCanvas.width = width;
            cropCanvas.height = height;
            
            // 执行裁剪
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
            
            // 下载裁剪后的图片
            cropCanvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileNameInput.value.replace('.png', '_crop.png');
                a.click();
                URL.revokeObjectURL(url);
            }, 'image/png');
            
            // 重置裁剪状态并恢复按钮显示
            isCropping = false;
            cropBox.style.display = 'none';
            saveCropBtn.style.display = 'none';
            downloadBtn.style.display = 'block';
            cancelBtn.style.display = 'block';
            cropBtn.style.display = 'block';
            previewImg.style.display = 'none';
            if (previewContainer) previewContainer.style.display = 'none';
            
            // 移除取消裁剪按钮（如果存在）
            const existingCancelCropBtn = document.querySelector('#cancel-crop-btn');
            if (existingCancelCropBtn) {
                buttonContainer.removeChild(existingCancelCropBtn);
            }
        });
    }

    // 使用定时器循环检测页面变化
    let buttonAdded = false;
    const checkInterval = setInterval(() => {
        // 如果按钮已添加则不再重复添加
        if (buttonAdded) return;
        
        // 检测页面中是否有视频元素
        const video = document.querySelector('video');
        if (video) {
            createVideoScreenshotButton();
            buttonAdded = true;
            
            // 监听视频元素变化
            const observer = new MutationObserver(() => {
                // 如果视频元素被移除，重置状态
                if (!document.contains(video)) {
                    buttonAdded = false;
                    observer.disconnect();
                }
            });
            
            // 监听视频元素的父级变化
            observer.observe(video.parentNode, {
                childList: true,
                subtree: true
            });
        }
    }, 1000); // 每秒检测一次
    
    // 页面卸载时清除定时器
    window.addEventListener('unload', () => {
        clearInterval(checkInterval);
    });
})();
