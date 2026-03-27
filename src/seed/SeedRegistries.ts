import { HttpError } from "../tools/CatchError";
import { RegistryEntity } from "../app/api/registry/registry.entity";
import RegistryService from "../app/api/registry/registry.service";
import { Log, TestNotAroute } from "../tools/Logger";
import { DeploymentType } from "../tools/ApplicationSettings";

export const RegistryUrl = "http://localhost:32000";

const registryService = new RegistryService();

export const SeedRegistries = async (adminUserId: number): Promise<void> => {
    const route = TestNotAroute(adminUserId, "seed");
    Log.log(route, "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
    Log.log(route, "┃ Part 🅱️ : 🗂️  Seed - Registries       ┃");
    Log.log(route, "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
    Log.log(route, "🚸 WORK IN PROGRESS...");
    const registryType: DeploymentType = process.env.APPLICATION_DEPLOYMENT as DeploymentType;

    const registries: RegistryEntity[] =
        registryType === "ONPREMISES"
            ? [
                  {
                      name: "registry",
                      url: RegistryUrl,
                      timeout: 1000,
                      type: "oci",
                      excludePaths: "helm-chart",
                      iconUrl: "https://assets.ubuntu.com/v1/be7e4cc6-COF-favicon-32x32.png",
                  },
                  {
                      name: "helm-registry",
                      url: RegistryUrl,
                      timeout: 2000,
                      type: "helm",
                      path: "helm-chart",
                      iconUrl: "https://helm.sh/img/helm.svg",
                  },
                  {
                      name: "zot",
                      url: "http://localhost:32001",
                      timeout: 2000,
                      type: "oci",
                      excludePaths: "helm-chart",
                      user: "admin",
                      iconUrl: "https://zotregistry.dev/v2.1.2/assets/images/logo.svg",
                  },
                  {
                      name: "helm-zot",
                      url: "http://localhost:32001",
                      timeout: 2000,
                      type: "helm",
                      path: "helm-chart",
                      user: "admin",
                      iconUrl: "https://zotregistry.dev/v2.1.2/assets/images/logo.svg",
                  },
              ]
            : [
                  {
                      name: "registry",
                      url: "http://registry.container-registry:5000",
                      gnUrl: RegistryUrl,
                      timeout: 1000,
                      type: "oci",
                      excludePaths: "helm-chart",
                      iconUrl: "https://kubuntu.org/wp-content/uploads/2015/04/Kubuntu_logo.svg",
                  },
                  {
                      name: "helm-registry",
                      url: "http://registry.container-registry:5000",
                      gnUrl: RegistryUrl,
                      timeout: 2000,
                      type: "helm",
                      path: "helm-chart",
                      iconUrl: "https://helm.sh/img/helm.svg",
                  },
                  {
                      name: "zot",
                      url: "http://zot.zot:5000",
                      gnUrl: "http://localhost:32001",
                      timeout: 2000,
                      type: "oci",
                      excludePaths: "helm-chart",
                      user: "admin",
                      iconUrl: "https://zotregistry.dev/v2.1.9/assets/images/favicon.png",
                  },
                  {
                      name: "helm-zot",
                      url: "http://zot.zot:5000",
                      gnUrl: "http://localhost:32001",
                      timeout: 2000,
                      type: "helm",
                      path: "helm-chart",
                      user: "admin",
                      iconUrl: "https://zotregistry.dev/v2.1.2/assets/images/logo.svg",
                  },
              ];
    for (const registry of registries) {
        Log.log(route, `✨ 🗂️  ${registry.name}`);
        try {
            await registryService.create(route, registry);
            Log.log(route, `✅ 🗂️  Registry ${registry.url} created`);
        } catch (err: unknown) {
            if ((err as HttpError).status === 409) {
                Log.log(route, `✅ 🗂️  Registry ${registry.url} exist`);
            } else {
                console.error(err);
            }
        }
    }
    Log.log(route, "");
};
