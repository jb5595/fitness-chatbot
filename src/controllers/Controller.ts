export class Controller {

    static log(...args: any[]){
        console.log(`[${this.name}]`, ...args)
    }
}