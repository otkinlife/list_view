// 工具按钮的处理函数

export function function1() {
    console.log('create');
    alert(2333);

    // 打开一个新页面
    const url = 'https://baidu.com'; // 替换为你想要打开的页面 URL
    const target = '_blank'; // 在新标签页中打开
    const features = 'noopener,noreferrer'; // 防止新页面获取对原页面的引用

    window.open(url, target, features);
}