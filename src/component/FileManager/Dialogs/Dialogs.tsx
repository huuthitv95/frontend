// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { useAppSelector } from "../../../redux/hooks.ts";
import AggregatedErrorDetail from "../../Dialogs/AggregatedErrorDetail.tsx";
import ArchivePreview from "../../Viewers/ArchivePreview/ArchivePreview.tsx";
import CodeViewer from "../../Viewers/CodeViewer/CodeViewer.tsx";
import CustomViewer from "../../Viewers/CustomViewer.tsx";
import DrawIOViewer from "../../Viewers/DrawIO/DrawIOViewer.tsx";
import EpubViewer from "../../Viewers/EpubViewer/EpubViewer.tsx";
import ExcalidrawViewer from "../../Viewers/Excalidraw/ExcalidrawViewer.tsx";
import MarkdownViewer from "../../Viewers/MarkdownEditor/MarkdownViewer.tsx";
import PdfViewer from "../../Viewers/PdfViewer.tsx";
import Photopea from "../../Viewers/Photopea/Photopea.tsx";
import VideoViewer from "../../Viewers/Video/VideoViewer.tsx";
import Wopi from "../../Viewers/Wopi.tsx";
import ColumnSetting from "../Explorer/ListView/ColumnSetting.tsx";
import AdvanceSearch from "../Search/AdvanceSearch/AdvanceSearch.tsx";
import ActivitiesDialog from "./Activities.tsx";
import ChangeIcon from "./ChangeIcon.tsx";
import CreateArchive from "./CreateArchive.tsx";
import CreateNew from "./CreateNew.tsx";
import CreateRemoteDownload from "./CreateRemoteDownload.tsx";
import DeleteConfirmation from "./DeleteConfirmation.tsx";
import DesktopMountSetup from "./DesktopMountSetup.tsx";
import DirectLinks from "./DirectLinks/DirectLinks.tsx";
import DirectLinksControl from "./DirectLinksControl.tsx";
import ExtractArchive from "./ExtractArchive.tsx";
import LockConflictDetails from "./LockConflictDetails.tsx";
import OpenWith from "./OpenWith.tsx";
import PathSelection from "./PathSelection.tsx";
import Relocate from "./Relocate.tsx";
import Rename from "./Rename.tsx";
import ReportAbuseDialog from "./ReportAbuseDialog.tsx";
import SaveAs from "./SaveAs.tsx";
import SetPermission from "./SetPermission.tsx";
import ManageShares from "./Share/ManageShares.tsx";
import PurchaseShare from "./Share/PurchaseShare.tsx";
import ShareDialog from "./Share/ShareDialog.tsx";
import StaleVersionConfirm from "./StaleVersionConfirm.tsx";
import Tags from "./Tags.tsx";
import VersionControl from "./VersionControl.tsx";

const Dialogs = () => {
  const showCreateArchive = useAppSelector((state) => state.globalState.createArchiveDialogOpen);
  const showExtractArchive = useAppSelector((state) => state.globalState.extractArchiveDialogOpen);
  const showRelocate = useAppSelector((state) => state.globalState.relocateDialogOpen);
  const showRemoteDownload = useAppSelector((state) => state.globalState.remoteDownloadDialogOpen);
  const showAdvancedSearch = useAppSelector((state) => state.globalState.advanceSearchOpen);
  const showListViewColumnSetting = useAppSelector((state) => state.globalState.listViewColumnSettingDialogOpen);
  const purchaseShare = useAppSelector((state) => state.globalState.purchaseShareDialogOpen);
  const directLink = useAppSelector((state) => state.globalState.directLinkDialogOpen);
  const excalidrawViewer = useAppSelector((state) => state.globalState.excalidrawViewer);
  const directLinkManagement = useAppSelector((state) => state.globalState.directLinkManagementDialogOpen);
  const reportAbuse = useAppSelector((state) => state.globalState.reportAbuseDialogOpen);
  const archivePreview = useAppSelector((state) => state.globalState.archiveViewer);
  const desktopMountSetup = useAppSelector((state) => state.globalState.desktopMountSetupDialogOpen);

  return (
    <>
      <CreateNew />
      <DeleteConfirmation />
      <AggregatedErrorDetail />
      <LockConflictDetails />
      <Rename />
      <PathSelection />
      <Tags />
      <ChangeIcon />
      <ShareDialog />
      <VersionControl />
      <SetPermission />
      <ManageShares />
      <ActivitiesDialog />
      <StaleVersionConfirm />
      <SaveAs />
      <Photopea />
      <OpenWith />
      <Wopi />
      <CodeViewer />
      <DrawIOViewer />
      <MarkdownViewer />
      <VideoViewer />
      <PdfViewer />
      <CustomViewer />
      <EpubViewer />
      {showCreateArchive != undefined && <CreateArchive />}
      {showExtractArchive != undefined && <ExtractArchive />}
      {showRelocate != undefined && <Relocate />}
      {showRemoteDownload != undefined && <CreateRemoteDownload />}
      {showAdvancedSearch != undefined && <AdvanceSearch />}
      {showListViewColumnSetting != undefined && <ColumnSetting />}
      {purchaseShare != undefined && <PurchaseShare />}
      {directLink != undefined && <DirectLinks />}
      {excalidrawViewer != undefined && <ExcalidrawViewer />}
      {directLinkManagement != undefined && <DirectLinksControl />}
      {reportAbuse != undefined && <ReportAbuseDialog />}
      {archivePreview != undefined && <ArchivePreview />}
      {desktopMountSetup != undefined && <DesktopMountSetup />}
    </>
  );
};

export default Dialogs;
