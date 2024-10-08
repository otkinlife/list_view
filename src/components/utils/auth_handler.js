// 实现各种鉴权的方法
// 返回格式：{
//  headers: {},
//  params: {}
// }
export function defaultAuth() {
   return {
       headers: {
           Authorization: 'Bearer token1'
       }
   }
}