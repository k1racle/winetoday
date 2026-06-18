"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { generateHTML, generateJSON } from "@tiptap/html";
import { serializeTiptapDocument, tiptapExtensions } from "@/lib/tiptap";
import { typografText } from "@/lib/typograf";
import { isEditorContentType } from "@/lib/editor-shared";
import type { EditorContentType, EditorEntrySummary } from "@/lib/editor-shared";

import { EditorTopbar } from "./EditorTopbar";
import { EditorBreadcrumb } from "./EditorBreadcrumb";
import { EditorSidebar } from "./EditorSidebar";
import { EditorToolbar } from "./EditorToolbar";
import { BasicInfoPanel } from "./BasicInfoPanel";
import { PublicationPanel } from "./PublicationPanel";
import { EventFieldsPanel } from "./EventFieldsPanel";
import { CoverPanel } from "./CoverPanel";
import { CategoriesTagsPanel } from "./CategoriesTagsPanel";
import { SourcesPanel } from "./SourcesPanel";
import { SeoPanel } from "./SeoPanel";
import { VideoFieldsPanel } from "./VideoFieldsPanel";
import { GalleryPhotosPanel } from "./GalleryPhotosPanel";
import { BlocksPanel } from "./BlocksPanel";
import { HelpModal } from "./HelpModal";
import { MediaPicker } from "./media";

import {
  createInitialState,
  normalizeFormState,
  uploadFile,
  refreshMediaAssets,
  parseJson,
  getErrorMessage,
  sortEditorTypes,
  publicPath,
  isMediaCollectionBlock,
  collectFormMediaIds,
  mergeMediaAssets,
} from "./utils";

import type {
  EditorApiError,
  EditorAuthorOption,
  EditorBlock,
  EditorEntryPayload,
  EditorSeo,
  EditorSession,
  EditorTaxonomyOption,
  FormState,
  SourceItem,
  UploadedAsset,
  ActiveMediaPanel,
} from "./types";

type AccountEditorProps = {
  initialQuery?: {
    type?: string;
    documentId?: string;
  };
};

export function AccountEditor({ initialQuery }: AccountEditorProps) {
  const itemsPerPage = 20;
  const [session, setSession] = useState<EditorSession | null>(null);
  const [authors, setAuthors] = useState<EditorAuthorOption[]>([]);
  const [categories, setCategories] = useState<EditorTaxonomyOption[]>([]);
  const [tags, setTags] = useState<EditorTaxonomyOption[]>([]);
  const [mediaAssets, setMediaAssets] = useState<UploadedAsset[]>([]);
  const [items, setItems] = useState<Record<EditorContentType, EditorEntrySummary[]>>({
    article: [],
    news: [],
    video: [],
    gallery: [],
    homepage: [],
  });
  const [selectedType, setSelectedType] = useState<EditorContentType>("article");
  const [form, setForm] = useState<FormState>(createInitialState("article"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [itemsQuery, setItemsQuery] = useState("");
  const [itemsPage, setItemsPage] = useState(1);
  const [activeMediaPanel, setActiveMediaPanel] = useState<ActiveMediaPanel>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allowedTypes = useMemo(() => sortEditorTypes(session?.capabilities.canCreate ?? []).filter((type) => type !== "homepage"), [session]);
  const canEditAll = session?.capabilities.canEditAll === true;
  const currentAccountAuthorId = session?.user?.memberProfile?.author?.id ?? null;
  const materialPublicPath = publicPath(selectedType, form.slug);

  const requestedType = useMemo(() => {
    const rawType = initialQuery?.type?.trim() ?? "";
    return isEditorContentType(rawType) ? rawType : null;
  }, [initialQuery?.type]);
  const requestedDocumentId = initialQuery?.documentId?.trim() || null;

  const filteredItems = useMemo(() => {
    const query = itemsQuery.trim().toLowerCase();
    const source = items[selectedType] ?? [];
    if (!query) return source;
    return source.filter((item) => item.title.toLowerCase().includes(query));
  }, [items, itemsQuery, selectedType]);

  const totalItemsPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const visibleItemsPage = Math.min(itemsPage, totalItemsPages);

  // Load session and initial data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const sessionResponse = await fetch("/api/editor/session", { cache: "no-store" });
        const sessionPayload = await parseJson<EditorSession | EditorApiError>(sessionResponse);

        if (!sessionResponse.ok || !sessionPayload || !("capabilities" in sessionPayload)) {
          throw new Error(getErrorMessage(sessionPayload as EditorApiError | null, "Не удалось открыть кабинет."));
        }

        if (cancelled) return;
        setSession(sessionPayload);

        const creatableTypes = sessionPayload.capabilities.canCreate ?? [];

        if (!creatableTypes.length) {
          setAuthors([]);
          setCategories([]);
          setTags([]);
          setMediaAssets([]);
          setItems({ article: [], news: [], video: [], gallery: [], homepage: [] });
          setError("У вашей учетной записи пока нет доступа к созданию или редактированию материалов.");
          return;
        }

        try {
          if (sessionPayload.capabilities.canEditAll) {
            const authorsResponse = await fetch("/api/editor/authors", { cache: "no-store" });
            const authorsPayload = await parseJson<EditorAuthorOption[] | EditorApiError>(authorsResponse);
            if (!cancelled && authorsResponse.ok && Array.isArray(authorsPayload)) {
              setAuthors(authorsPayload);
            }
          } else if (!cancelled) {
            setAuthors([]);
          }
        } catch {
          if (!cancelled) setAuthors([]);
        }

        try {
          const [categoriesResponse, tagsResponse] = await Promise.all([
            fetch("/api/editor/categories", { cache: "no-store" }),
            fetch("/api/editor/tags", { cache: "no-store" }),
          ]);
          const [categoriesPayload, tagsPayload] = await Promise.all([
            parseJson<EditorTaxonomyOption[] | EditorApiError>(categoriesResponse),
            parseJson<EditorTaxonomyOption[] | EditorApiError>(tagsResponse),
          ]);
          if (!cancelled && categoriesResponse.ok && Array.isArray(categoriesPayload)) setCategories(categoriesPayload);
          if (!cancelled && tagsResponse.ok && Array.isArray(tagsPayload)) setTags(tagsPayload);
        } catch {
          if (!cancelled) {
            setCategories([]);
            setTags([]);
          }
        }

        try {
          const mediaResponse = await fetch("/api/editor/media", { cache: "no-store" });
          const mediaPayload = await parseJson<UploadedAsset[] | EditorApiError>(mediaResponse);
          if (!cancelled && mediaResponse.ok && Array.isArray(mediaPayload)) setMediaAssets(mediaPayload);
        } catch {
          if (!cancelled) setMediaAssets([]);
        }

        const orderedCreatableTypes = sortEditorTypes(creatableTypes);
        const initialType = orderedCreatableTypes[0] ?? "article";
        const initialAuthorId = sessionPayload.capabilities.canEditAll
          ? sessionPayload.user?.memberProfile?.author?.id ?? null
          : null;
        setSelectedType(initialType);
        setForm(createInitialState(initialType, { author: initialAuthorId }));

        const loadedEntries = await Promise.all(
          orderedCreatableTypes.map(async (type) => {
            const response = await fetch(`/api/editor/content/${type}`, { cache: "no-store" });
            const payload = await parseJson<EditorEntrySummary[] | EditorApiError>(response);
            if (!response.ok || !Array.isArray(payload)) {
              throw new Error(getErrorMessage(payload as EditorApiError | null, `Не удалось загрузить список ${type}.`));
            }
            return [type, payload] as const;
          }),
        );

        if (cancelled) return;

        setItems((current) => {
          const next = { ...current };
          for (const [type, payload] of loadedEntries) {
            next[type] = payload;
          }
          return next;
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Не удалось открыть кабинет.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  // Open requested entry from query
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (loading || !requestedType || !requestedDocumentId || requestedType === "homepage" || !allowedTypes.includes(requestedType)) return;
    if (selectedType === requestedType && form.documentId === requestedDocumentId) return;
    void openEntry(requestedType, requestedDocumentId);
  }, [allowedTypes, form.documentId, loading, requestedDocumentId, requestedType, selectedType]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Ensure media assets are loaded for the current form (covers save responses and edge cases)
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (loading || !form.documentId) return;
    void ensureMediaAssetsForForm(form);
  }, [form.documentId]);
  /* eslint-enable react-hooks/exhaustive-deps */

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function createBlankForm(type: EditorContentType, authorId = currentAccountAuthorId) {
    return createInitialState(type, { author: canEditAll ? authorId : null });
  }

  function selectType(type: EditorContentType) {
    setSelectedType(type);
    setItemsQuery("");
    setItemsPage(1);
    setForm(createBlankForm(type));
    setError(null);
    setSuccess(null);
  }

  function toggleMultiSelectItem(key: "categories" | "tags", id: number) {
    setForm((current) => {
      const selected = current[key].includes(id)
        ? current[key].filter((itemId) => itemId !== id)
        : [...current[key], id];
      return { ...current, [key]: selected };
    });
  }

  function updateSource(index: number, key: keyof SourceItem, value: string) {
    setForm((current) => ({
      ...current,
      sources: current.sources.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  }

  function toggleGalleryPhoto(id: number) {
    setForm((current) => {
      const selected = current.photos.includes(id)
        ? current.photos.filter((photoId) => photoId !== id)
        : [...current.photos, id];
      return { ...current, photos: selected };
    });
  }

  function clearGalleryPhotos() {
    setForm((current) => ({ ...current, photos: [] }));
  }

  function addSource() {
    setForm((current) => ({ ...current, sources: [...current.sources, { name: "", url: "" }] }));
  }

  function removeSource(index: number) {
    setForm((current) => ({
      ...current,
      sources: current.sources.length > 1 ? current.sources.filter((_, itemIndex) => itemIndex !== index) : [{ name: "", url: "" }],
    }));
  }

  function updateSeo<K extends keyof EditorSeo>(key: K, value: EditorSeo[K]) {
    setForm((current) => ({ ...current, seo: { ...current.seo, [key]: value } }));
  }

  function updateBlock(index: number, nextBlock: EditorBlock) {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.map((block, currentIndex) => (currentIndex === index ? nextBlock : block)),
    }));
  }

  function typografHtmlEditorContent(content: Extract<EditorBlock, { __component: "blocks.html-editor" }>["content"]) {
    const html = typeof content === "string" ? content : generateHTML(content, []);
    return generateJSON(typografText(html), tiptapExtensions);
  }

  function typografBlock(block: EditorBlock): EditorBlock {
    switch (block.__component) {
      case "blocks.html-editor":
        return {
          ...block,
          title: typeof block.title === "string" ? typografText(block.title) : block.title,
          content: typografHtmlEditorContent(block.content),
        };
      case "blocks.embed":
        return {
          ...block,
          title: typeof block.title === "string" ? typografText(block.title) : block.title,
          html: typografText(block.html),
        };
      case "blocks.image-gallery":
        return {
          ...block,
          title: typeof block.title === "string" ? typografText(block.title) : block.title,
          description: typeof block.description === "string" ? typografText(block.description) : block.description,
        };
      case "blocks.image-slider":
        return {
          ...block,
          title: typeof block.title === "string" ? typografText(block.title) : block.title,
          description: typeof block.description === "string" ? typografText(block.description) : block.description,
          photoSource: typeof block.photoSource === "string" ? typografText(block.photoSource) : block.photoSource,
        };
      case "blocks.image-highlight":
        return {
          ...block,
          caption: typeof block.caption === "string" ? typografText(block.caption) : block.caption,
          credit: typeof block.credit === "string" ? typografText(block.credit) : block.credit,
        };
      default:
        return block;
    }
  }

  function handleApplyTypograf() {
    setError(null);
    setSuccess(null);
    try {
      setForm((current) => ({
        ...current,
        title: typografText(current.title),
        excerpt: typografText(current.excerpt),
        blocks: current.blocks.map((block) => typografBlock(block)),
      }));
      setSuccess("Типограф применён.");
    } catch (typografError) {
      setError(typografError instanceof Error ? typografError.message : "Не удалось применить типограф.");
    }
  }

  function addBlock(type: EditorBlock["__component"]) {
    let nextBlock: EditorBlock;
    if (type === "blocks.html-editor") {
      nextBlock = { __component: type, title: "", content: { type: "doc", content: [{ type: "paragraph" }] } };
    } else if (type === "blocks.embed") {
      nextBlock = { __component: type, title: "", html: "" };
    } else if (type === "blocks.image-highlight") {
      nextBlock = { __component: type, caption: "", credit: "", image: null };
    } else if (type === "blocks.image-slider") {
      nextBlock = { __component: type, title: "", description: "", photoSource: "", images: [] };
    } else {
      nextBlock = { __component: type, title: "", description: "", images: [] };
    }
    setForm((current) => ({ ...current, blocks: [...current.blocks, nextBlock] }));
  }

  function removeBlock(index: number) {
    setForm((current) => ({ ...current, blocks: current.blocks.filter((_, currentIndex) => currentIndex !== index) }));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setForm((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.blocks.length) return current;
      const nextBlocks = [...current.blocks];
      const [block] = nextBlocks.splice(index, 1);
      nextBlocks.splice(nextIndex, 0, block);
      return { ...current, blocks: nextBlocks };
    });
  }

  function openHighlightMediaPanel(blockIndex: number) {
    setActiveMediaPanel({ kind: "block-highlight", blockIndex });
  }

  function closeMediaPanel() {
    setActiveMediaPanel(null);
  }

  function selectAssetFromPanel(id: number | null) {
    if (!activeMediaPanel) return;

    if (activeMediaPanel.kind === "cover") {
      updateForm("cover", id);
      return;
    }

    if (activeMediaPanel.kind === "block-highlight" && typeof activeMediaPanel.blockIndex === "number") {
      const block = form.blocks[activeMediaPanel.blockIndex];
      if (block?.__component === "blocks.image-highlight") {
        updateBlock(activeMediaPanel.blockIndex, { ...block, image: id });
      }
    }
  }

  async function refreshType(type: EditorContentType) {
    const response = await fetch(`/api/editor/content/${type}`, { cache: "no-store" });
    const payload = await parseJson<EditorEntrySummary[] | EditorApiError>(response);
    if (!response.ok || !Array.isArray(payload)) {
      throw new Error(getErrorMessage(payload as EditorApiError | null, "Не удалось обновить список материалов."));
    }
    setItems((current) => ({ ...current, [type]: payload }));
  }

  async function openEntry(type: EditorContentType, documentId: string) {
    setError(null);
    setSuccess(null);
    const response = await fetch(`/api/editor/content/${type}/${documentId}`, { cache: "no-store" });
    const payload = await parseJson<EditorEntryPayload>(response);

    if (!response.ok || !payload) {
      setError(getErrorMessage(payload as EditorApiError | null, "Не удалось открыть материал."));
      return;
    }

    const nextForm = normalizeFormState(type, payload);
    setSelectedType(type);
    setForm(nextForm);
    await ensureMediaAssetsForForm(nextForm);
  }

  async function ensureMediaAssetsForForm(nextForm: FormState) {
    const neededIds = collectFormMediaIds(nextForm).filter((id) => !mediaAssets.some((asset) => asset.id === id));
    if (!neededIds.length) return;

    const mediaPayload = await refreshMediaAssets(neededIds);
    if (!mediaPayload) return;

    setMediaAssets((current) => {
      const existingIds = new Set(current.map((asset) => asset.id));
      const merged = [...current];
      for (const asset of mediaPayload) {
        if (!existingIds.has(asset.id)) {
          merged.push(asset);
        }
      }
      return merged;
    });
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const id = await uploadFile(file);
      updateForm("cover", id);
      const mediaPayload = await refreshMediaAssets();
      if (mediaPayload) setMediaAssets((current) => mergeMediaAssets(current, mediaPayload));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Не удалось загрузить обложку.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleBlockFiles(index: number, event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setError(null);
    try {
      const uploadedIds = await Promise.all(files.map((file) => uploadFile(file)));

      setForm((current) => {
        const block = current.blocks[index];
        if (!block) return current;

        if (block.__component === "blocks.image-highlight") {
          return {
            ...current,
            blocks: current.blocks.map((b, i) =>
              i === index ? { ...b, image: uploadedIds[0] ?? null } : b
            ),
          };
        }

        if (isMediaCollectionBlock(block)) {
          return {
            ...current,
            blocks: current.blocks.map((b, i) =>
              i === index && (b.__component === "blocks.image-gallery" || b.__component === "blocks.image-slider")
                ? { ...b, images: [...b.images, ...uploadedIds] }
                : b
            ),
          };
        }

        return current;
      });

      const mediaPayload = await refreshMediaAssets();
      if (mediaPayload) setMediaAssets((current) => mergeMediaAssets(current, mediaPayload));

      const targetBlock = form.blocks[index];
      if (targetBlock?.__component === "blocks.image-highlight") {
        openHighlightMediaPanel(index);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Не удалось загрузить изображение.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleGalleryFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setError(null);
    try {
      const uploadedIds = await Promise.all(files.map((file) => uploadFile(file)));
      setForm((current) => ({ ...current, photos: [...current.photos, ...uploadedIds] }));
      const mediaPayload = await refreshMediaAssets();
      if (mediaPayload) setMediaAssets((current) => mergeMediaAssets(current, mediaPayload));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Не удалось загрузить изображение.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleSave(statusOverride?: "draft" | "published") {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const normalizedExcerpt = form.excerpt.trim();
      const targetStatus = statusOverride ?? form.status;

      if ((selectedType === "article" || selectedType === "news") && targetStatus === "published" && !normalizedExcerpt) {
        throw new Error("Для публикации нужно заполнить краткое описание.");
      }

      const payload = {
        data: {
          title: form.title,
              slug: form.slug,
              excerpt: form.excerpt,
              materialLabel: form.materialLabel,
              cover: form.cover,
              archiveCover: form.archiveCover,
              author: form.author,
              categories: form.categories,
              tags: form.tags,
              homepageSpecialBlock: form.homepageSpecialBlock,
              status: targetStatus,
              publishedAtCustom: form.publishedAtCustom ? new Date(form.publishedAtCustom).toISOString() : null,
              readingTime: form.readingTime,
              coverSource: form.coverSource,
              ...(selectedType === "video"
                ? {}
                : { sources: form.sources.filter((item) => item.name.trim() || item.url.trim()) }),
              startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
              endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : "",
              locationName: form.locationName,
              city: form.city,
              address: form.address,
              ticketUrl: form.ticketUrl,
              videoUrl: form.videoUrl,
              duration: form.duration,
              seo: form.seo,
              photos: selectedType === "gallery" ? form.photos : undefined,
              ...(selectedType === "gallery"
                ? {}
                : {
                    blocks: form.blocks.map((block) => {
                      if (block.__component !== "blocks.html-editor") return block;
                      return { ...block, content: serializeTiptapDocument(block.content) };
                    }),
                  }),
        },
      };

      const endpoint = form.documentId
        ? `/api/editor/content/${selectedType}/${form.documentId}`
        : `/api/editor/content/${selectedType}`;

      const response = await fetch(endpoint, {
        method: form.documentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const saved = await parseJson<EditorEntryPayload>(response);

      if (!response.ok || !saved?.documentId) {
        throw new Error(getErrorMessage(saved as EditorApiError | null, "Не удалось сохранить материал."));
      }

      const nextForm = normalizeFormState(selectedType, saved);
      setForm(nextForm);
      await ensureMediaAssetsForForm(nextForm);
      await refreshType(selectedType);
      setSuccess(form.documentId ? "Материал обновлён." : "Материал создан.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить материал.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!form.documentId) return;
    if (!window.confirm("Удалить этот материал?")) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const response = await fetch(`/api/editor/content/${selectedType}/${form.documentId}`, { method: "DELETE" });
      const payload = await parseJson<{ ok?: boolean } | EditorApiError>(response);

      if (!response.ok || !payload || ("ok" in payload && payload.ok !== true)) {
        throw new Error(getErrorMessage(payload as EditorApiError | null, "Не удалось удалить материал."));
      }

      await refreshType(selectedType);
      setForm(createBlankForm(selectedType));
      setSuccess("Материал удалён.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить материал.");
    } finally {
      setSaving(false);
    }
  }

  // Modal media picker helpers
  const activePanelAsset = useMemo(() => {
    if (!activeMediaPanel) return null;
    if (activeMediaPanel.kind === "cover") {
      return mediaAssets.find((asset) => asset.id === form.cover) ?? null;
    }
    if (activeMediaPanel.kind === "block-highlight" && typeof activeMediaPanel.blockIndex === "number") {
      const block = form.blocks[activeMediaPanel.blockIndex];
      if (block?.__component === "blocks.image-highlight") {
        return mediaAssets.find((asset) => asset.id === block.image) ?? null;
      }
    }
    return null;
  }, [activeMediaPanel, form.blocks, form.cover, mediaAssets]);

  const activePanelAccept = "image" as const;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white pt-14 dark:bg-[#141414]">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">Загружаем кабинет…</div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-white pt-14 dark:bg-[#141414]">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">{error}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pt-14 dark:bg-[#141414]">
      <EditorTopbar session={session} onHelpClick={() => setHelpOpen(true)} onMenuClick={() => setMobileMenuOpen(true)} />

      <EditorBreadcrumb
        type={selectedType}
        documentId={form.documentId}
        publicPath={materialPublicPath}
        status={form.status}
      />

      <div className="flex">
        <EditorSidebar
          session={session}
          allowedTypes={allowedTypes}
          items={items}
          selectedType={selectedType}
          onSelectType={selectType}
          onCreateNew={selectType}
          onSelectItem={openEntry}
          query={itemsQuery}
          onQueryChange={(value) => {
            setItemsQuery(value);
            setItemsPage(1);
          }}
          page={visibleItemsPage}
          totalPages={totalItemsPages}
          onPageChange={(page) => setItemsPage(page)}
          mobileOpen={mobileMenuOpen}
          onMobileOpenChange={setMobileMenuOpen}
          onHelpClick={() => setHelpOpen(true)}
        />

        <main className="flex-1 p-5 lg:p-6">
          {error ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">{error}</div>
            ) : null}
            {success ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-200">{success}</div>
            ) : null}

            {selectedType !== "homepage" ? (
              <EditorToolbar
                type={selectedType}
                slug={form.slug}
                status={form.status}
                documentId={form.documentId}
                saving={saving}
                onSaveDraft={() => void handleSave("draft")}
                onPublish={() => void handleSave("published")}
              />
            ) : null}

            <div className="grid gap-5 lg:grid-cols-[1fr_410px]">
              <div className="space-y-4">
                  <BasicInfoPanel
                    form={form}
                    onChange={updateForm}
                    onApplyTypograf={handleApplyTypograf}
                  />
                  <PublicationPanel
                    form={form}
                    authors={authors}
                    canEditAll={canEditAll}
                    onChange={updateForm}
                  />
                  <EventFieldsPanel
                    form={form}
                    onChange={updateForm}
                  />
                  {selectedType === "video" ? (
                    <VideoFieldsPanel
                      videoUrl={form.videoUrl}
                      duration={form.duration}
                      onChangeVideoUrl={(value) => updateForm("videoUrl", value)}
                      onChangeDuration={(value) => updateForm("duration", value)}
                    />
                  ) : null}
                  {selectedType === "gallery" ? (
                    <GalleryPhotosPanel
                      photos={form.photos}
                      assets={mediaAssets}
                      onToggle={toggleGalleryPhoto}
                      onUpload={handleGalleryFiles}
                      onClearAll={clearGalleryPhotos}
                    />
                  ) : null}
                  <BlocksPanel
                    type={selectedType}
                    blocks={form.blocks}
                    assets={mediaAssets}
                    onAdd={addBlock}
                    onUpdate={updateBlock}
                    onRemove={removeBlock}
                    onMove={moveBlock}
                    onUpload={handleBlockFiles}
                  />
                  <SeoPanel seo={form.seo} onChange={updateSeo} />
                </div>

                <div className="space-y-4">
                  <CoverPanel
                    form={form}
                    assets={mediaAssets}
                    activePanel={activeMediaPanel}
                    onOpenPanel={() => setActiveMediaPanel({ kind: "cover" })}
                    onClosePanel={closeMediaPanel}
                    onUpload={handleCoverUpload}
                    onSelectCover={(id) => updateForm("cover", id)}
                    onChangeSource={(value) => updateForm("coverSource", value)}
                  />
                  <CategoriesTagsPanel
                    categories={categories}
                    selectedCategories={form.categories}
                    tags={tags}
                    selectedTags={form.tags}
                    showTags={selectedType !== "gallery"}
                    onToggleCategory={(id) => toggleMultiSelectItem("categories", id)}
                    onToggleTag={(id) => toggleMultiSelectItem("tags", id)}
                  />
                  {selectedType !== "video" ? (
                    <SourcesPanel
                      sources={form.sources}
                      onChange={updateSource}
                      onAdd={addSource}
                      onRemove={removeSource}
                    />
                  ) : null}
                </div>
              </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-5 dark:border-white/10">
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={!form.documentId || saving}
                className="rounded border border-red-200 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                🗑 Удалить материал
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleSave("draft")}
                  disabled={saving}
                  className="rounded border border-black/10 bg-[#eeeeee] px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-300 disabled:opacity-50 dark:border-white/10 dark:bg-[#2a2a2a] dark:hover:bg-zinc-700"
                >
                  {saving ? "Сохранение..." : "💾 Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave("published")}
                  disabled={saving}
                  className="rounded bg-[#1a4d2e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d7a4f] disabled:opacity-50 dark:bg-[#4ade80] dark:text-black dark:hover:bg-[#86efac]"
                >
                  {saving ? "Сохранение..." : "🚀 Опубликовать"}
                </button>
              </div>
            </div>
        </main>
      </div>

      {activeMediaPanel ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/55 p-4">
          <div className="my-6 w-full max-w-4xl rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#141414]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">Выбор медиафайла</h3>
              <button type="button" onClick={closeMediaPanel} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">✕</button>
            </div>
            <MediaPicker
              assets={mediaAssets}
              accept={activePanelAccept}
              selectedId={activePanelAsset?.id ?? null}
              onSelect={(id) => {
                selectAssetFromPanel(id);
                if (id !== null) closeMediaPanel();
              }}
              onUpload={handleCoverUpload}
              uploadLabel="Загрузить новый файл"
            />
          </div>
        </div>
      ) : null}

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

