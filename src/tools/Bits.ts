export default function Bits(value: number): string {
    const ko = value / 1024;
    const mo = ko / 1024;
    const go = mo / 1024;
    if(go>1) {
        return `${go.toFixed(2)} Go`;
    }
    if(mo>1) {
        return `${mo.toFixed(2)} Mo`;
    }
    if(ko>1) {
        return `${ko.toFixed(2)} Ko`;
    }
    return value.toString();
}