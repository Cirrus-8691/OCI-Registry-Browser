import { ImageMeta, RegistryUsage, UsageExplain, UseHost } from "./RegistryUsage";

export const K8sDeploymentSample = (meta: ImageMeta) => {
  const host = UseHost(meta);
  const spec = meta.registry.user
    ? `spec:
        imagePullSecrets:
          - name: container-registery-secrets`
    : "spec:";
  return `apiVersion: apps/v1
kind: Deployment
spec:
  template:
    ${spec}
      containers:
      - name: ${meta.image.name}
        image: ${host}/${meta.image.path}${meta.image.name}:${meta.image.tag}
...`;
}

export class Kubectl implements RegistryUsage {
  key = "kubectl";
  title = "Kubectl";

  get CanPull() {
    return true;
  }
  pull(meta: ImageMeta): UsageExplain[] {
    return [
      {
        titleKey18n: "kubectl",
        detailKey18n: `kubectl apply -f <values.yaml>`,
      },
      {
        titleKey18n: "kubectl-values",
        detailKey18n: K8sDeploymentSample(meta),
      },
    ];
  }

  get CanPush() {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  push(meta: ImageMeta): UsageExplain[] {
    return [];
  }

  get CanRun() {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run(meta: ImageMeta): UsageExplain[] {
    return [];
  }
    get CanSignature(): boolean {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signature(meta: ImageMeta): UsageExplain[] {
        return [];
    }
}
/*
# https://www.scaleway.com/en/docs/containers/kubernetes/how-to/deploy-image-from-container-registry/
# https://stackoverflow.com/questions/62137632/create-kubernetes-secret-for-docker-registry-terraform
resource "kubernetes_secret" "scaleway_container_registery" {
  metadata {
    namespace = local.REDASH_SERVER_NAMESPACE
    name = "scaleway-container-registery"
  }
  type = "kubernetes.io/dockerconfigjson"
  depends_on = [ 
    kubernetes_namespace.redash_server_namespace,
  ]
  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "${local.scaleway_container_registery.server}" = {
          "username" = local.scaleway_container_registery.hostname
          "password" = var.SCW_SECRET_KEY
          "auth" = base64encode("${local.scaleway_container_registery_name}:${var.SCW_SECRET_KEY}")
        }
      }
    })
  }

}
  */
