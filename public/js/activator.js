export default class VocsActivator {
    constructor (isActive) {
        this.isActive = isActive;
    }

    get status(){
        return this.isActive;
    }

    set status(newStatus){
        this.isActive = newStatus;
        if (this.isActive){
            setTimeout(() => {
                if (this.isActive) {
                    this.isActive = false;
                    console.error('!!!VOCS deactivated!!!');
                }
            }, 10000);
        }
    }
}
