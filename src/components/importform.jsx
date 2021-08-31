import React, { Component } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import FileBrowserModal from "./filebrowsermodal";
import "regenerator-runtime/runtime";
import 'semantic-ui-css/semantic.min.css';
import { Confirm } from 'semantic-ui-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faCheckCircle, faAngleLeft, faFileAlt} from "@fortawesome/free-solid-svg-icons";
import Loader from "../components/loader";
import ErrorFooter from "../components/errorfooter";

class ImportForm extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      error: null,
      hasServerError: false,
      askAutosaveLogic: false,
      autosaveLogic: "ask",
      showFileBrowser: false,
      showMarkerBrowser: false,
      currentFileFolder: null,
      currentMarkerFolder: null,
      output: '',
      loadedChannelNames: null,
      markerFilename: null
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.openFileBrowser = this.openFileBrowser.bind(this);
    this.openMarkerBrowser = this.openMarkerBrowser.bind(this);
    this.onFileSelected = this.onFileSelected.bind(this);
    this.onMarkerFileSelected = this.onMarkerFileSelected.bind(this);
    this.outputChanged = this.outputChanged.bind(this);

    this.filePath = React.createRef();
    this.markerPath = React.createRef();

  }

  handleError(err) {
    let err_code = null;
    if (err.includes(" ERR: ")) {
      const err_split = err.split(" ERR: ");
      if (err_split.length == 2) {
        err_code = err_split[0];
        err = err_split[1];
      }
    }
    if (err_code == "AUTO ASK") {
      this.setState({ askAutosaveLogic: true });
      err = null;
    }
    this.setState({ loading: false, error: err });
    console.error(err);
  }

  handleSubmit(event, importCallback) {
    // Convert the event into a standard object.
    event.preventDefault();
    const form_data = new FormData(event.target);
    const json_data = Object.fromEntries(form_data);

    // Add some special parameters.
    json_data["autosave_logic"] = this.state.autosaveLogic;
    this.props.updateInputFile(json_data["filepath"]);

    // Indicate we are loading.
    this.setState({
      loading: true,
      error: null
    });

    // Post the data to the backend.
    fetch('/api/import', {
      method: 'POST',
      body: JSON.stringify(json_data),
      headers: {'Content-Type': 'application/json'}
    }).then(response => {
      this.setState({ loading: false });
      response.json().then(data => {
        if(!response.ok) {
          this.handleError(data.error);
        }
        else {
          importCallback(data);
        }
      });
    }).catch(err => {
      this.handleError(err);
    });
  }

  openFileBrowser() {
    this.setState({ showFileBrowser: true});
  }

  openMarkerBrowser() {
    this.setState({ showMarkerBrowser: true});
  }

  openCloudBrowser() {
    this.setState({ showCloudBrowser: true});
  }

  onFileSelected(file, folder=null) {
    this.setState({ 
      showFileBrowser: false
    });
    if (file && file.path) {
      this.filePath.current.value = file.path;
      this.setState({
        currentFileFolder: folder
      });
    }
  }

  onMarkerFileSelected(file, folder=null) {
    this.setState({ 
      showMarkerBrowser: false
    });
    if (file && file.path) {
      this.markerPath.current.value = file.path;
      this.setState({
        currentMarkerFolder: folder
      });
    }
  }

  storyUuidChanged(evt) {
    this.setState({storyUuid: evt.target.value});
  }

  outputChanged(evt) {
    this.setState({output: evt.target.value});
  }

  render() {
    // TODO:set server error when no response from server
    const confirmServerError = this.state.hasServerError;
    const confirmAutosave = !confirmServerError && this.state.askAutosaveLogic;
    return (
      <div>
        { this.renderLocalFields(this.props.importCallback) }
        <ErrorFooter message={this.state.error} />
        <Confirm
          header="Unable to connect to Minerva Author" 
          content={
            <div className="content">
              <div>
                It is possible the Minerva Author executable has stopped running.
              </div>
              <br/>
              <div>
                Reopen the Minerva Author executable, and <strong>reload this tab</strong>.
              </div>
            </div>
          }
          cancelButton={null}
          confirmButton="Reload this tab"
          size="small"
          open={confirmServerError}
          onConfirm={() => {
            window.location.reload();
          }}
        />
        <Confirm
          header="Autosave Detected" 
          content={
            <div className="content">
              <div>
                Minerva Author automatically saved the most recent progress before closing.
              </div>
              <br/>
              <div>
                <strong>Do you want to load the automatically saved data?</strong>
              </div>
            </div>
          }
          cancelButton="No, ignore it!"
          confirmButton="Yes, load it!"
          size="small"
          open={confirmAutosave}
          onCancel={() => { 
            this.setState({
              autosaveLogic: "skip",
              askAutosaveLogic: false,
              error: "Click 'Import' again to load without autosave."
            })
          }}
          onConfirm={() => {
            this.setState({
              autosaveLogic: "load",
              askAutosaveLogic: false,
              error: "Click 'Import' again to load from the autosave."
            })
          }}
        />
      </div>
    )
  }

  renderLocalFields(importCallback) {
    let imageHome = this.state.currentFileFolder ? this.state.currentFileFolder : this.state.currentMarkerFolder;
    let markerHome = this.state.currentMarkerFolder ? this.state.currentMarkerFolder : this.state.currentFileFolder;
    return (
      <form className="ui form" onSubmit={(event) => {
            this.handleSubmit(event, importCallback);
          }}>
          <label htmlFor="filepath">Enter path to image or story: </label>
          <div className="field">
          <div className="ui action input">
            <input ref={this.filePath} id="filepath" name="filepath" type="text" />
            <button type="button" onClick={this.openFileBrowser} className="ui button">Browse</button>
            <FileBrowserModal open={this.state.showFileBrowser} close={this.onFileSelected}
              title="Select image or story (tiff, svs, json)" 
              onFileSelected={this.onFileSelected} 
              filter={["dat", "tif", "tiff", "svs", "json"]}
              home={imageHome}
              />
          </div>
          </div>
          <label htmlFor="filepath">Optional marker_name csv: </label>
          <div className="field">
          <div className="ui action input">
            <input ref={this.markerPath} id="csvpath" name="csvpath" type="text" />
            <button type="button" onClick={this.openMarkerBrowser} className="ui button">Browse</button>
            <FileBrowserModal open={this.state.showMarkerBrowser} close={this.onMarkerFileSelected}
              title="Select a marker name csv" 
              onFileSelected={this.onMarkerFileSelected} 
              filter={["csv"]}
              home={markerHome}
              />
          </div>
          </div>
          <label htmlFor="filepath">Optional output name: </label>
          <div className="field">
          <input id="dataset" name="dataset" type="text" value={this.state.output} onChange={this.outputChanged} />
          </div>
          <button className="ui button"> Import </button>
          <Loader active={this.state.loading} />
        </form>
    );
  }

}

export default ImportForm;
