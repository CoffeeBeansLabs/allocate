class Device {
  private static device: string;
  public setDevice(newDevice:string):string {
    Device.device = newDevice.toLowerCase();
    console.log(`Device Dtype: ${Device.device}`);
    return Device.device;
  }
  public getDeviceType():string{
    return Device.device;
  }
  isWeb() {
    return Device.device === 'web';
  }
  isAndroid(){
    return Device.device === 'android';
  }
  isIOS(){
    return Device.device === 'ios';
  }
}
export default new Device();
  