import cliProgress from 'cli-progress';
import colors from 'ansi-colors'

export function CreateProgressBars(): cliProgress.MultiBar {
    const progressBars = new cliProgress.MultiBar({
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.rect)
    return progressBars
}
export default CreateProgressBars