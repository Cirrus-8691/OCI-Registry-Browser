import crypto from 'crypto';
/**
 * Just a Sleep function
 * @param timeOutMs 
 */
export default async function Sleep(timeOutMs : number): Promise<void> {
    if(timeOutMs <= 0) {
      timeOutMs = 100;
    }
    return new Promise(resolve => {
        setTimeout(() => resolve(), timeOutMs);
    });
}
/**
 * Sleep for a while. 
 * If several requests fail at the same time, do not replay them all together.
 * @param timeOutMs 
 * @param aboutMs default is 2000ms.
 */
export function SleepAbout(timeOutMs : number, aboutMs = 2000): Promise<void> {

    const byteBufffer = crypto.randomBytes(2);

    timeOutMs += aboutMs - ( 2 * aboutMs * byteBufffer[0] / 256);
    if(timeOutMs <= 0) {
      timeOutMs = timeOutMs + aboutMs * byteBufffer[1] / 256;
    }
    if(timeOutMs <= 0) {
      timeOutMs = 100;
    }
    return new Promise(resolve => {
        setTimeout(() => resolve(), timeOutMs);
    });
}