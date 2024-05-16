// 示例：点击按钮时显示一个警告框  
document.addEventListener('DOMContentLoaded', function() {  
    var downloadButtons = document.querySelectorAll('.download-button');  
    downloadButtons.forEach(function(button) {  
        button.addEventListener('click', function(event) {  
            event.preventDefault(); // 阻止默认的链接行为（如果有的话）  
            alert('感谢您的下载请求！');  
        });  
    });  
});  
  
// 这里可以添加更多的JavaScript代码来处理更复杂的功能