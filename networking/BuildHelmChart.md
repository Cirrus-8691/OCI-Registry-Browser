# How To Deploy Helm charts repository

Helm charts are used to fully describe how to deploy Docker images of easiware api, api-public, web app.

https://helm.sh/docs/topics/charts/

## Charts contains description of:

- An **ingress** to customise host of services, websockets and webapp like "easiware-start-{branche_name}...scw.cloud".
- A **service** to use Kubernetes DNS to route queries to many **POD** ( ~ Docker running container).
- A **deployment** to deploy many **POD**.
- A **secret** to manage all customisable variables like ENV settings.

## New chart
https://helm.sh/docs/topics/charts/

- Create:
```bash
cd helm-chart/
sudo microk8s helm create newChartName
```
- Check syntax:
```bash
sudo microk8s helm lint newChartName
```
- Build:
```bash
sudo microk8s helm package newChartName --version "0.1.1"
```
You'll have to update 'buildCharts.sh' to add the build of the new chart

# Push chart in container private registry

On microk8s-registry on localhost:32000 to **lint, package and push** use:

```bash
cd networking/

VERSION="0.2.0"
sudo ./buildChartsInRepo.sh $VERSION
```

ou bien

```bash
cd networking/

VERSION="0.1.1"
sudo ./buildChartsInZot.sh $VERSION
```
