"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { IconVolume } from "@tabler/icons-react"

export default function SpeakerButton() {

    function handleSpeak() {
        const text = "P U PAD"

        const utterance = new SpeechSynthesisUtterance(text)

        utterance.lang = "en-IN"
        utterance.rate = 1
        utterance.pitch = 1

        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={handleSpeak}
                    variant="secondary"
                    size="icon-sm"
                    className="hover:bg-primary transition-all ease-in-out rounded-md cursor-pointer"
                >
                    <IconVolume />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Pronounce name</p>
            </TooltipContent>
        </Tooltip>
    )
}
