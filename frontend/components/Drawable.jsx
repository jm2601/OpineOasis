import "./Drawable.css"
import {ReactSketchCanvas, ReactSketchCanvasRef, CanvasPath} from "react-sketch-canvas";
import {IconButton, Paper, ToggleButton, ToggleButtonGroup, Tooltip} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import ClearIcon from '@mui/icons-material/Clear';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import {createRef, Component, RefObject} from "react";


export default class Drawable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            width: props.width ?? "600px",
            height: props.height ?? "400px",
            title: props.title ?? "Drawable Canvas",
            disableUndo: props.disableUndo ?? false,
            mode: "draw"
        }

        this.canvasRef = createRef();
        this.changeMode = this.changeMode.bind(this);
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.getCanvas = this.getCanvas.bind(this);
        this.createPng = this.createPng.bind(this);
        this.loadPaths = this.loadPaths.bind(this);
    }


    changeMode (
        _event,
        newMode,
    ) {
        this.setState({
            ...this.state,
            mode: newMode
        });
        this.canvasRef.current?.eraseMode(newMode === "erase");
    };

    undo() {
        this.canvasRef.current?.undo();
    }

    redo() {
        this.canvasRef.current?.redo();
    }

    clearCanvas() {
        this.canvasRef.current?.resetCanvas();
    }

    createPng() {
        return this.canvasRef.current?.exportImage("png");
    }

    getCanvas() {
        return this.canvasRef;
    }

    loadPaths(paths) {
        this.canvasRef.current?.loadPaths(paths);
    }

    render() {
        return (
            <Paper elevation={8} style={{width: this.state.width, height: this.state.height}}>
                <div className={"drawable"}>
                    <div className={"drawable-controls"}>
                        <p className={"drawable-title"}>{this.state.title}</p>
                        <ToggleButtonGroup
                            value={this.state.mode}
                            exclusive
                            onChange={this.changeMode}
                            size={"small"}
                        >
                            <ToggleButton value="draw">
                                <Tooltip title="Draw">
                                    <EditIcon />
                                </Tooltip>
                            </ToggleButton>

                            <ToggleButton value="erase">
                                <Tooltip title="Erase">
                                    <EditOffIcon />
                                </Tooltip>
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {
                            this.state.disableUndo ? null : (
                                <>
                                    <Tooltip title="Undo">
                                        <IconButton onClick={this.undo} style={{marginLeft: "30px"}}>
                                            <UndoIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Redo">
                                        <IconButton onClick={this.redo} style={{marginRight: "30px"}}>
                                            <RedoIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )
                        }

                        <Tooltip title="Clear canvas">
                            <IconButton onClick={this.clearCanvas}>
                                <ClearIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <ReactSketchCanvas
                        ref={this.canvasRef}
                        style={{
                            flexGrow: 1
                        }}
                        strokeWidth={4}
                        eraserWidth={12}
                        strokeColor="black"
                        onChange={this.props.onChange}
                    />
                </div>
            </Paper>
        );
    }
}
