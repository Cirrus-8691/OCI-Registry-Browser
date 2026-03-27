export type DeploymentType = "KUBERNETES" | "ONPREMISES";

export default class ApplicationSettings {
    static Deployment: DeploymentType = (process.env.NEXT_PUBLIC_DEPLOYMENT as DeploymentType) ?? "ONPREMISES";
    static RunningOnK8s = ApplicationSettings.Deployment === "KUBERNETES";
}
