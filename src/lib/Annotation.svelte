<script lang="ts">
    import { editMode, selectedItem, isEditing } from "@/stores";

    export let id: number;
    export let annotation: any;
    export let start: boolean;
</script>

{#if annotation[ start ? 0 : 1 ] != null}
    <div class={start ? "annotationStart" : "annotationEnd"}>
        <input
            type="text"
            disabled={!$editMode || $selectedItem != id}
            on:focus={() => {
                isEditing.update((e) => e + 1);
                console.log("in focus", $isEditing);
            }}
            on:blur={() => {
                isEditing.update((e) => e - 1);
                console.log("out of focus", $isEditing);
            }}
            bind:value={annotation[ start ? 0 : 1 ]}
        />
    </div>
{/if}