const pagePath = process.env.NEXT_PUBLIC_BASE_PAGES_PATH
    ? (process.env.NEXT_PUBLIC_BASE_PAGES_PATH.endsWith("/")
        ? process.env.NEXT_PUBLIC_BASE_PAGES_PATH
        : `${process.env.NEXT_PUBLIC_BASE_PAGES_PATH}/`
    )
    : "";
export const LinkHomeHref = () => (pagePath);
export const LinkPagesHref = (index?: string) => (index
    ? `${pagePath}/pages/${index}`
    : pagePath
);
// export const LinkHref = (index?: string) => (`/${index ?? ""}`);

const join = (path1: string, path2: string, path3: string) => {
    const expectedPath1 = path1.endsWith("/") ? path1: `${path1}/`;
    const expectedPath3 = path1.startsWith("/") ? path3: `/${path3}`;
    return expectedPath1+path2+expectedPath3;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const ApiPath = (endPoint: string) => (join(basePath, "api", endPoint));
export const ImageSrc = (imageName: string) => (join(basePath, "images", imageName));
