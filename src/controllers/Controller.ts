export class Controller {

    static log(...args: string[]){
        console.log(`[${this.name}]`, ...args)
    }
}